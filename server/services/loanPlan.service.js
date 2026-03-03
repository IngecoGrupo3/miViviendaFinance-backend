const PERIOD_DAYS_ORDINARY_YEAR = {
  ANNUAL: 360,
  SEMIANNUAL: 180,
  QUARTERLY: 90,
  BIMONTHLY: 60,
  MONTHLY: 30,
  BIWEEKLY: 15,
  WEEKLY: 7,
  DAILY: 1
};

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function percent4(rateDecimal) {
  return roundTo(rateDecimal * 100, 4);
}

function periodToDays(period) {
  const days = PERIOD_DAYS_ORDINARY_YEAR[period];
  if (!days) {
    const err = new Error(`Periodo inválido: ${period}`);
    err.status = 400;
    throw err;
  }
  return days;
}

function toEffectivePeriodicRate({ rate_kind, rate_value, rate_period, capitalization }) {
  const j = rate_value / 100;
  if (rate_kind === "EFFECTIVE") {
    return j;
  }

  if (rate_kind !== "NOMINAL") {
    const err = new Error(`rate_kind inválido: ${rate_kind}`);
    err.status = 400;
    throw err;
  }

  if (!capitalization) {
    const err = new Error("capitalization es obligatorio para tasa NOMINAL");
    err.status = 400;
    throw err;
  }

  const baseDays = periodToDays(rate_period);
  const capDays = periodToDays(capitalization);

  if (capDays > baseDays) {
    const err = new Error("capitalization no puede ser mayor que rate_period");
    err.status = 400;
    throw err;
  }

  const m = baseDays / capDays;
  if (!Number.isInteger(m) || m <= 0) {
    const err = new Error("rate_period debe ser múltiplo exacto de capitalization (año ordinario)");
    err.status = 400;
    throw err;
  }

  const periodic = j / m;
  const effective = (1 + periodic) ** m - 1;
  return effective;
}

function convertEffectiveRateToTargetPeriod({ effective_rate, from_period, to_period }) {
  const fromDays = periodToDays(from_period);
  const toDays = periodToDays(to_period);
  const converted = (1 + effective_rate) ** (toDays / fromDays) - 1;
  return converted;
}

function toEffectiveDailyRate({ rate_kind, rate_value, rate_period, capitalization }) {
  const effectiveInRatePeriod = toEffectivePeriodicRate({
    rate_kind,
    rate_value,
    rate_period,
    capitalization
  });
  const days = periodToDays(rate_period);
  const ted = (1 + effectiveInRatePeriod) ** (1 / days) - 1;
  return ted;
}

function computeBasePayment({ principal, ip, n }) {
  if (n <= 0 || !Number.isInteger(n)) {
    const err = new Error("Número total de cuotas inválido");
    err.status = 400;
    throw err;
  }

  if (Math.abs(ip) < 1e-15) return principal / n;

  const denominator = 1 - (1 + ip) ** -n;
  if (denominator === 0) {
    const err = new Error("No se pudo calcular la cuota base (denominador 0)");
    err.status = 400;
    throw err;
  }

  return (principal * ip) / denominator;
}

function ensureIntegerCount(count, context) {
  if (!Number.isFinite(count) || count <= 0 || !Number.isInteger(count)) {
    const err = new Error(`Cantidad de periodos inválida${context ? ` (${context})` : ""}`);
    err.status = 400;
    throw err;
  }
}

function computeDownPayment({ property_price, down_payment_mode, down_payment_percent, down_payment_amount }) {
  if (down_payment_mode === "PERCENT") {
    return (property_price * down_payment_percent) / 100;
  }
  return down_payment_amount;
}

function computeTermMonths({ term_value, term_unit }) {
  return term_unit === "YEARS" ? term_value * 12 : term_value;
}

export function buildLoanPlanRatePreview(inputs) {
  const termMonths = computeTermMonths(inputs);
  const paymentDays = periodToDays(inputs.payment_frequency);
  const totalDays = termMonths * 30;
  const totalPeriods = totalDays / paymentDays;
  ensureIntegerCount(totalPeriods, "term_value/term_unit vs payment_frequency");

  const netPrice = inputs.property_price - (inputs.apply_bono ? inputs.bono_amount : 0);

  const downPayment = computeDownPayment({
    property_price: netPrice,
    down_payment_mode: inputs.down_payment_mode,
    down_payment_percent: inputs.down_payment_percent ?? 0,
    down_payment_amount: inputs.down_payment_amount ?? 0
  });
  const loanAmount = netPrice - downPayment;

  const basePaymentPeriod = inputs.payment_frequency;
  const segments =
    Array.isArray(inputs.rate_segments) && inputs.rate_segments.length > 0
      ? inputs.rate_segments
      : typeof inputs.rate_value === "number"
      ? [{ from_period: 1, to_period: totalPeriods, rate_value: inputs.rate_value }]
      : [];

  if (inputs.rate_mode === "CONSTANT" && segments.length !== 1) {
    const err = new Error("rate_segments debe tener 1 segmento cuando rate_mode es CONSTANT");
    err.status = 400;
    throw err;
  }

  const constantTed =
    inputs.rate_mode === "CONSTANT"
      ? toEffectiveDailyRate({
          rate_kind: inputs.rate_kind,
          rate_value: segments[0]?.rate_value,
          rate_period: inputs.rate_period,
          capitalization: inputs.capitalization
        })
      : null;
  const constantIp =
    inputs.rate_mode === "CONSTANT" ? (1 + constantTed) ** paymentDays - 1 : null;

  const rates = segments.map((s) => {
    const tedSegment =
      inputs.rate_mode === "CONSTANT"
        ? constantTed
        : toEffectiveDailyRate({
            rate_kind: inputs.rate_kind,
            rate_value: s.rate_value,
            rate_period: inputs.rate_period,
            capitalization: inputs.capitalization
          });
    const ipSegment =
      inputs.rate_mode === "CONSTANT" ? constantIp : (1 + tedSegment) ** paymentDays - 1;

    return {
      from_period: s.from_period,
      to_period: s.to_period,
      periods_count: s.to_period - s.from_period + 1,
      source_rate: {
        rate_kind: inputs.rate_kind,
        rate_value: roundTo(s.rate_value, 7),
        rate_period: inputs.rate_period,
        ...(inputs.capitalization ? { capitalization: inputs.capitalization } : {})
      },
      effective_rate_payment_period: roundTo(ipSegment, 7),
      effective_rate_payment_period_percent: percent4(ipSegment)
    };
  });

  return {
    loan_amount: roundTo(loanAmount, 7),
    net_price: roundTo(netPrice, 7),
    down_payment_amount: roundTo(downPayment, 7),
    term_months: termMonths,
    payment_frequency: basePaymentPeriod,
    total_periods: totalPeriods,
    rate_mode: inputs.rate_mode,
    rates,
    ...(inputs.rate_mode === "CONSTANT"
      ? {
          payment_schedule: buildConstantPaymentSchedule({
            principal: loanAmount,
            ted: constantTed,
            days_per_period: paymentDays,
            n: totalPeriods
          })
        }
      : {
          payment_schedule: buildVariablePaymentSchedule({
            principal: loanAmount,
            days_per_period: paymentDays,
            n: totalPeriods,
            rate_kind: inputs.rate_kind,
            rate_period: inputs.rate_period,
            capitalization: inputs.capitalization,
            segments
          })
        })
  };
}

export function buildConstantPaymentSchedule({ principal, ted, days_per_period, n }) {
  const ip = (1 + ted) ** days_per_period - 1;
  const basePayment = computeBasePayment({ principal, ip, n });

  let balance = principal;
  const schedule = [];

  for (let k = 1; k <= n; k++) {
    const startingBalance = balance;
    const interestFactor = ip;
    const interest = interestFactor * startingBalance;
    let amortization = basePayment - interest;
    let payment = basePayment;

    if (k === n) {
      amortization = startingBalance;
      payment = roundTo(interest + amortization, 7);
      balance = 0;
    } else {
      balance = balance - amortization;
    }

    schedule.push({
      period_number: k,
      starting_balance: roundTo(startingBalance, 7),
      payment_amount: roundTo(payment, 7),
      interest_amount: roundTo(interest, 7),
      amortization_amount: roundTo(amortization, 7),
      ending_balance: roundTo(balance, 7)
    });
  }

  return {
    ted: roundTo(ted, 7),
    ip: roundTo(ip, 7),
    base_payment_amount: roundTo(basePayment, 7),
    rows: schedule
  };
}

export function buildVariablePaymentSchedule({
  principal,
  days_per_period,
  n,
  rate_kind,
  rate_period,
  capitalization,
  segments
}) {
  let balance = principal;
  const rows = [];
  const segmentSummaries = [];

  let currentSegmentIndex = 0;
  let currentIp = null;
  let currentTed = null;
  let currentPayment = null;

  const sortedSegments = [...segments].sort((a, b) => a.from_period - b.from_period);

  for (let k = 1; k <= n; k++) {
    while (
      currentSegmentIndex < sortedSegments.length &&
      k > sortedSegments[currentSegmentIndex].to_period
    ) {
      currentSegmentIndex++;
    }

    const seg = sortedSegments[currentSegmentIndex];
    if (!seg) {
      const err = new Error("No hay segmento de tasa para el periodo actual");
      err.status = 400;
      throw err;
    }

    const isSegmentStart = k === seg.from_period;
    if (isSegmentStart) {
      currentTed = toEffectiveDailyRate({
        rate_kind,
        rate_value: seg.rate_value,
        rate_period,
        capitalization
      });
      currentIp = (1 + currentTed) ** days_per_period - 1;

      const remaining = n - k + 1;
      currentPayment = computeBasePayment({ principal: balance, ip: currentIp, n: remaining });

      segmentSummaries.push({
        from_period: seg.from_period,
        to_period: seg.to_period,
        rate_value: roundTo(seg.rate_value, 7),
        ted: roundTo(currentTed, 7),
        tep: roundTo(currentIp, 7),
        payment_amount: roundTo(currentPayment, 7)
      });
    }

    const startingBalance = balance;
    const interest = currentIp * startingBalance;
    let amortization = currentPayment - interest;
    let payment = currentPayment;

    if (k === n) {
      amortization = startingBalance;
      payment = interest + amortization;
      balance = 0;
    } else {
      balance = balance - amortization;
    }

    rows.push({
      period_number: k,
      starting_balance: roundTo(startingBalance, 7),
      payment_amount: roundTo(payment, 7),
      interest_amount: roundTo(interest, 7),
      amortization_amount: roundTo(amortization, 7),
      ending_balance: roundTo(balance, 7)
    });
  }

  return {
    segments: segmentSummaries,
    rows
  };
}
