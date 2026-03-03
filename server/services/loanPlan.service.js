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
    return roundTo(j, 7);
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
  return roundTo(effective, 7);
}

function convertEffectiveRateToTargetPeriod({ effective_rate, from_period, to_period }) {
  const fromDays = periodToDays(from_period);
  const toDays = periodToDays(to_period);
  const converted = (1 + effective_rate) ** (toDays / fromDays) - 1;
  return roundTo(converted, 7);
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

  const netPrice = roundTo(
    inputs.property_price - (inputs.apply_bono ? inputs.bono_amount : 0),
    7
  );

  const downPayment = roundTo(
    computeDownPayment({
      property_price: netPrice,
      down_payment_mode: inputs.down_payment_mode,
      down_payment_percent: inputs.down_payment_percent ?? 0,
      down_payment_amount: inputs.down_payment_amount ?? 0
    }),
    7
  );
  const loanAmount = roundTo(netPrice - downPayment, 7);

  const basePaymentPeriod = inputs.payment_frequency;
  const segments = inputs.rate_segments || [];

  const rates = segments.map((s) => {
    const effectiveInSourcePeriod = toEffectivePeriodicRate({
      rate_kind: inputs.rate_kind,
      rate_value: s.rate_value,
      rate_period: inputs.rate_period,
      capitalization: inputs.capitalization
    });

    const effectiveInPaymentPeriod = convertEffectiveRateToTargetPeriod({
      effective_rate: effectiveInSourcePeriod,
      from_period: inputs.rate_period,
      to_period: basePaymentPeriod
    });

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
      effective_rate_payment_period: effectiveInPaymentPeriod,
      effective_rate_payment_period_percent: percent4(effectiveInPaymentPeriod)
    };
  });

  return {
    loan_amount: loanAmount,
    net_price: netPrice,
    down_payment_amount: downPayment,
    term_months: termMonths,
    payment_frequency: basePaymentPeriod,
    total_periods: totalPeriods,
    rate_mode: inputs.rate_mode,
    rates
  };
}
