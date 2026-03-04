const PERIOD_DAYS_ORDINARY_YEAR = {
  ANNUAL: 360,
  SEMIANNUAL: 180,
  QUARTERLY: 90,
  BIMONTHLY: 60,
  MONTHLY: 30,
  BIWEEKLY: 15,
  DAILY: 1
};

// ACA ESTAN LOS CALCULOS DE TASA PERIÓDICA, CONVERSIÓN DE TASA, ETC

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


// ACA ESTA LA PARTE DE CÁLCULO DE CUOTA BASE
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

function buildGraceMap({ n, grace_segments }) {
  const map = Array(n + 1).fill(null);
  const segments = Array.isArray(grace_segments) ? grace_segments : [];

  for (const seg of segments) {
    for (let k = seg.from_period; k <= seg.to_period; k++) {
      map[k] = seg.grace_kind;
    }
  }

  return map;
}

function countRemainingNormalPeriods({ graceMap, from_period, n }) {
  let count = 0;
  for (let k = from_period; k <= n; k++) {
    if (!graceMap[k]) count++;
  }
  return count;
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

function computeNPV(cashflows, rate) {
  if (!Number.isFinite(rate) || rate <= -1) {
    const err = new Error("discount_rate_periodic inválida para VAN");
    err.status = 400;
    throw err;
  }

  let sum = 0;
  for (let t = 0; t < cashflows.length; t++) {
    sum += cashflows[t] / (1 + rate) ** t;
  }
  return sum;
}

function computeIRR(cashflows, { tol = 1e-10, rateTol = 1e-12, maxIter = 200 } = {}) {
  const hasPos = cashflows.some((x) => x > 0);
  const hasNeg = cashflows.some((x) => x < 0);
  if (!hasPos || !hasNeg) return null;

  const npv = (r) => {
    if (!Number.isFinite(r) || r <= -1) return NaN;
    const df = 1 / (1 + r);
    if (!Number.isFinite(df)) return NaN;

    let sum = 0;
    let dfPow = 1;
    for (let t = 0; t < cashflows.length; t++) {
      const term = cashflows[t] * dfPow;
      sum += term;
      dfPow *= df;
      if (!Number.isFinite(sum) || !Number.isFinite(dfPow)) return NaN;
      if (dfPow === 0) break;
    }
    return sum;
  };

  const lowCandidates = [-0.999999, -0.99, -0.9, -0.75, -0.5, -0.25, -0.1, 0];
  let low = lowCandidates[0];
  let fLow = npv(low);
  for (let i = 0; i < lowCandidates.length && !Number.isFinite(fLow); i++) {
    low = lowCandidates[i];
    fLow = npv(low);
  }

  let high = 10;
  let fHigh = npv(high);

  let expand = 0;
  while (Number.isFinite(fLow) && Number.isFinite(fHigh) && fLow * fHigh > 0 && expand < 60) {
    high *= 2;
    fHigh = npv(high);
    expand++;
    if (high > 1e6) break;
  }

  if (!Number.isFinite(fLow) || !Number.isFinite(fHigh) || fLow * fHigh > 0) return null;

  for (let i = 0; i < maxIter; i++) {
    const mid = (low + high) / 2;
    const fMid = npv(mid);
    if (!Number.isFinite(fMid)) {
      low = mid;
      fLow = npv(low);
      continue;
    }

    if (Math.abs(fMid) <= tol) return mid;
    if (high - low <= rateTol) return mid;

    if (fLow * fMid > 0) {
      low = mid;
      fLow = fMid;
    } else {
      high = mid;
      fHigh = fMid;
    }
  }

  return (low + high) / 2;
}

function computeIndicators({ loan_amount, payment_days, rows, discount_rate_tea }) {
  const cashflows = [
    loan_amount,
    ...rows.map((r) => -Number((r.total_payment_amount ?? r.payment_amount) || 0))
  ];

  const tirPeriodic = computeIRR(cashflows);
  const kPeriodsPerYear = 360 / payment_days;

  const tceaAnnual =
    tirPeriodic === null ? null : (1 + tirPeriodic) ** kPeriodsPerYear - 1;

  const teaDecimal =
    typeof discount_rate_tea === "number" ? discount_rate_tea / 100 : null;
  const discountRatePeriodic =
    teaDecimal === null ? null : (1 + teaDecimal) ** (payment_days / 360) - 1;

  const van =
    discountRatePeriodic === null ? null : computeNPV(cashflows, discountRatePeriodic);

  return {
    indicators: {
      tir_periodic: tirPeriodic === null ? null : roundTo(tirPeriodic, 10),
      tcea_annual: tceaAnnual === null ? null : roundTo(tceaAnnual, 10),
      van: van === null ? null : roundTo(van, 7),
      k_periods_per_year: kPeriodsPerYear,
      discount_rate_periodic:
        discountRatePeriodic === null ? null : roundTo(discountRatePeriodic, 10)
    },
    cashflows
  };
}

function normalizeCharges({ charges, net_price, property_price }) {
  const insuranceDes = charges?.insurance?.desgravamen;
  const insuranceBien = charges?.insurance?.bien;
  const feePhysical = charges?.fees?.physical_statement;
  const itf = charges?.itf;

  const desgravamen = {
    enabled: Boolean(insuranceDes?.enabled),
    monthly_rate: typeof insuranceDes?.monthly_rate === "number" ? insuranceDes.monthly_rate : 0
  };

  const bien = {
    enabled: Boolean(insuranceBien?.enabled),
    monthly_rate: typeof insuranceBien?.monthly_rate === "number" ? insuranceBien.monthly_rate : 0,
    insured_value:
      typeof insuranceBien?.insured_value === "number"
        ? insuranceBien.insured_value
        : typeof net_price === "number"
        ? net_price
        : property_price
  };

  const physical_statement = {
    enabled: Boolean(feePhysical?.enabled),
    amount: typeof feePhysical?.amount === "number" ? feePhysical.amount : 0
  };

  const itfConfig = {
    enabled: Boolean(itf?.enabled),
    rate: typeof itf?.rate === "number" ? itf.rate : 0.00005
  };

  return { desgravamen, bien, physical_statement, itf: itfConfig };
}

function enrichScheduleRowWithCharges({ row, payment_days, chargesConfig }) {
  const basePaymentAmount = Number(row.payment_amount || 0);
  const startingBalance = Number(row.starting_balance || 0);

  const rateForPeriod = (monthlyRate) => (monthlyRate / 30) * payment_days;
  const desgravamenFactorForPeriod = (monthlyRate) =>
    (1 + monthlyRate) ** (payment_days / 30) - 1;

  const insuranceDesgravamenAmount = chargesConfig.desgravamen.enabled
    ? startingBalance * desgravamenFactorForPeriod(chargesConfig.desgravamen.monthly_rate)
    : 0;

  const insuranceBienAmount = chargesConfig.bien.enabled
    ? chargesConfig.bien.insured_value * rateForPeriod(chargesConfig.bien.monthly_rate)
    : 0;

  const feePhysicalStatementAmount = chargesConfig.physical_statement.enabled
    ? chargesConfig.physical_statement.amount
    : 0;

  const chargesSubtotalAmount =
    insuranceDesgravamenAmount + insuranceBienAmount + feePhysicalStatementAmount;

  const totalWithoutItfAmount = basePaymentAmount + chargesSubtotalAmount;

  const itfAmount = chargesConfig.itf.enabled ? chargesConfig.itf.rate * totalWithoutItfAmount : 0;

  const totalPaymentAmount = totalWithoutItfAmount + itfAmount;

  return {
    ...row,
    base_payment_amount: roundTo(basePaymentAmount, 7),
    insurance_desgravamen_amount: roundTo(insuranceDesgravamenAmount, 7),
    insurance_bien_amount: roundTo(insuranceBienAmount, 7),
    fee_physical_statement_amount: roundTo(feePhysicalStatementAmount, 7),
    charges_subtotal_amount: roundTo(chargesSubtotalAmount, 7),
    total_without_itf_amount: roundTo(totalWithoutItfAmount, 7),
    itf_amount: roundTo(itfAmount, 7),
    total_payment_amount: roundTo(totalPaymentAmount, 7)
  };
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
  const chargesConfig = normalizeCharges({
    charges: inputs.charges,
    net_price: netPrice,
    property_price: inputs.property_price
  });

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

  const graceMode = inputs.grace_mode ?? "NONE";
  const scotiaGraceDays = typeof inputs.scotia_grace_days === "number" ? inputs.scotia_grace_days : 0;
  const graceMap =
    graceMode === "CLASS_PERIODS"
      ? buildGraceMap({ n: totalPeriods, grace_segments: inputs.grace_segments })
      : null;

  const segmentForPeriod1 =
    segments.find((s) => s.from_period <= 1 && s.to_period >= 1) ?? segments[0] ?? null;

  const tedForScotiaGrace =
    graceMode === "SCOTIA_DAYS" && segmentForPeriod1
      ? toEffectiveDailyRate({
          rate_kind: inputs.rate_kind,
          rate_value: segmentForPeriod1.rate_value,
          rate_period: inputs.rate_period,
          capitalization: inputs.capitalization
        })
      : null;

  const principalBeforeGrace = loanAmount;
  const principalAfterGrace =
    graceMode === "SCOTIA_DAYS" && scotiaGraceDays > 0 && tedForScotiaGrace !== null
      ? (() => {
           const ig = principalBeforeGrace * ((1 + tedForScotiaGrace) ** scotiaGraceDays - 1);
           const sdg = chargesConfig.desgravamen.enabled
            ? principalBeforeGrace *
              ((1 + chargesConfig.desgravamen.monthly_rate) ** (scotiaGraceDays / 30) - 1)
            : 0;
           const sbg = chargesConfig.bien.enabled
             ? chargesConfig.bien.insured_value * (chargesConfig.bien.monthly_rate / 30) * scotiaGraceDays
             : 0;
           return principalBeforeGrace + ig + sdg + sbg;
        })()
      : principalBeforeGrace;

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

  const paymentSchedule =
    inputs.rate_mode === "CONSTANT"
      ? buildConstantPaymentSchedule({
          principal: principalAfterGrace,
          ted: constantTed,
          days_per_period: paymentDays,
          n: totalPeriods,
          grace:
            graceMode === "CLASS_PERIODS"
              ? { grace_mode: graceMode, graceMap }
              : { grace_mode: graceMode }
        })
      : buildVariablePaymentSchedule({
          principal: principalAfterGrace,
          days_per_period: paymentDays,
          n: totalPeriods,
          rate_kind: inputs.rate_kind,
          rate_period: inputs.rate_period,
          capitalization: inputs.capitalization,
          segments,
          grace:
            graceMode === "CLASS_PERIODS"
              ? { grace_mode: graceMode, graceMap }
              : { grace_mode: graceMode }
        });

  const enrichedRows = paymentSchedule.rows.map((r) =>
    enrichScheduleRowWithCharges({ row: r, payment_days: paymentDays, chargesConfig })
  );
  const paymentScheduleWithCharges = { ...paymentSchedule, rows: enrichedRows };

  const { indicators, cashflows } = computeIndicators({
    loan_amount: loanAmount,
    payment_days: paymentDays,
    rows: paymentScheduleWithCharges.rows,
    discount_rate_tea: inputs.discount_rate_tea
  });

  return {
    loan_amount: roundTo(loanAmount, 7),
    net_price: roundTo(netPrice, 7),
    down_payment_amount: roundTo(downPayment, 7),
    term_months: termMonths,
    payment_frequency: basePaymentPeriod,
    total_periods: totalPeriods,
    rate_mode: inputs.rate_mode,
    grace: {
      grace_mode: graceMode,
      ...(graceMode === "SCOTIA_DAYS"
        ? {
            scotia_grace_days: scotiaGraceDays,
            principal_before_grace: roundTo(principalBeforeGrace, 7),
            principal_after_grace: roundTo(principalAfterGrace, 7),
            ted_used: tedForScotiaGrace !== null ? roundTo(tedForScotiaGrace, 7) : null
          }
        : {})
    },
    rates,
    payment_schedule: paymentScheduleWithCharges,
    indicators,
    ...(inputs.include_cashflows ? { cashflows: cashflows.map((c) => roundTo(c, 7)) } : {})
  };
}

export function buildConstantPaymentSchedule({ principal, ted, days_per_period, n, grace }) {
  const ip = (1 + ted) ** days_per_period - 1;
  const graceMode = grace?.grace_mode ?? "NONE";
  const graceMap = graceMode === "CLASS_PERIODS" ? grace?.graceMap : null;

  const basePayment =
    graceMode === "CLASS_PERIODS" && graceMap ? null : computeBasePayment({ principal, ip, n });

  let balance = principal;
  const rows = [];
  let currentPayment = basePayment;
  const paymentRecalculations = [];

  for (let k = 1; k <= n; k++) {
    const startingBalance = balance;
    const graceKind = graceMap ? graceMap[k] : null;

    const interest = ip * startingBalance;
    let payment = 0;
    let amortization = 0;

    if (graceMode === "CLASS_PERIODS" && graceKind === "TOTAL") {
      payment = 0;
      amortization = 0;
      balance = startingBalance + interest;
    } else if (graceMode === "CLASS_PERIODS" && graceKind === "PARTIAL") {
      payment = interest;
      amortization = 0;
      balance = startingBalance;
    } else {
      if (graceMode === "CLASS_PERIODS" && graceMap) {
        const prevGrace = k > 1 ? graceMap[k - 1] : null;
        if (k === 1 || prevGrace) {
          const remainingNormal = countRemainingNormalPeriods({ graceMap, from_period: k, n });
          if (remainingNormal <= 0) {
            const err = new Error("No hay periodos normales restantes para recalcular cuota");
            err.status = 400;
            throw err;
          }
          currentPayment = computeBasePayment({ principal: startingBalance, ip, n: remainingNormal });
          paymentRecalculations.push({
            from_period: k,
            payment_amount: roundTo(currentPayment, 7),
            remaining_normal_periods: remainingNormal
          });
        }
      }

      payment = currentPayment;
      amortization = payment - interest;
      balance = startingBalance - amortization;
    }

    if (k === n) {
      if (graceMode === "CLASS_PERIODS" && graceMap && graceMap[k]) {
        const err = new Error("El último periodo no puede ser de gracia");
        err.status = 400;
        throw err;
      }
      amortization = startingBalance;
      payment = interest + amortization;
      balance = 0;
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
    ted: roundTo(ted, 7),
    ip: roundTo(ip, 7),
    ...(basePayment !== null ? { base_payment_amount: roundTo(basePayment, 7) } : {}),
    ...(paymentRecalculations.length > 0 ? { payment_recalculations: paymentRecalculations } : {}),
    rows
  };
}

export function buildVariablePaymentSchedule({
  principal,
  days_per_period,
  n,
  rate_kind,
  rate_period,
  capitalization,
  segments,
  grace
}) {
  const graceMode = grace?.grace_mode ?? "NONE";
  const graceMap = graceMode === "CLASS_PERIODS" ? grace?.graceMap : null;

  let balance = principal;
  const rows = [];
  const segmentSummaries = [];
  const paymentRecalculations = [];

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
      currentPayment = null; // fuerza recálculo en el primer periodo normal del tramo

      segmentSummaries.push({
        from_period: seg.from_period,
        to_period: seg.to_period,
        rate_value: roundTo(seg.rate_value, 7),
        ted: roundTo(currentTed, 7),
        tep: roundTo(currentIp, 7),
        payment_amount: null,
        payment_from_period: null
      });
    }

    const graceKind = graceMap ? graceMap[k] : null;
    const startingBalance = balance;
    const interest = currentIp * startingBalance;

    let payment = 0;
    let amortization = 0;

    if (graceMode === "CLASS_PERIODS" && graceKind === "TOTAL") {
      payment = 0;
      amortization = 0;
      balance = startingBalance + interest;
    } else if (graceMode === "CLASS_PERIODS" && graceKind === "PARTIAL") {
      payment = interest;
      amortization = 0;
      balance = startingBalance;
    } else {
      const prevGrace = graceMap && k > 1 ? graceMap[k - 1] : null;
      const shouldRecalc = currentPayment === null || isSegmentStart || (graceMode === "CLASS_PERIODS" && prevGrace);

      if (shouldRecalc) {
        const remaining =
          graceMode === "CLASS_PERIODS" && graceMap
            ? countRemainingNormalPeriods({ graceMap, from_period: k, n })
            : n - k + 1;

        if (remaining <= 0) {
          const err = new Error("No hay periodos normales restantes para recalcular cuota");
          err.status = 400;
          throw err;
        }

        currentPayment = computeBasePayment({ principal: startingBalance, ip: currentIp, n: remaining });
        paymentRecalculations.push({
          from_period: k,
          payment_amount: roundTo(currentPayment, 7),
          remaining_periods: remaining,
          rate_value: roundTo(seg.rate_value, 7)
        });

        const lastSummary = segmentSummaries[segmentSummaries.length - 1];
        if (lastSummary && lastSummary.payment_amount === null) {
          lastSummary.payment_amount = roundTo(currentPayment, 7);
          lastSummary.payment_from_period = k;
        }
      }

      payment = currentPayment;
      amortization = payment - interest;
      balance = startingBalance - amortization;
    }

    if (k === n) {
      if (graceMode === "CLASS_PERIODS" && graceMap && graceMap[k]) {
        const err = new Error("El último periodo no puede ser de gracia");
        err.status = 400;
        throw err;
      }
      amortization = startingBalance;
      payment = interest + amortization;
      balance = 0;
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
    ...(paymentRecalculations.length > 0 ? { payment_recalculations: paymentRecalculations } : {}),
    rows
  };
}
