import { z } from "zod";

export const periodEnum = z.enum([
  "ANNUAL",
  "SEMIANNUAL",
  "QUARTERLY",
  "BIMONTHLY",
  "MONTHLY",
  "BIWEEKLY",
  "DAILY"
]);

const rateKindEnum = z.enum(["EFFECTIVE", "NOMINAL"]);
const graceKindEnum = z.enum(["TOTAL", "PARTIAL"]);
const graceModeEnum = z.enum(["NONE", "SCOTIA_DAYS", "CLASS_PERIODS"]);
const downPaymentModeEnum = z.enum(["PERCENT", "AMOUNT"]);
const rateModeEnum = z.enum(["CONSTANT", "VARIABLE"]);
const termUnitEnum = z.enum(["YEARS", "MONTHS"]);

const PERIOD_DAYS_ORDINARY_YEAR = {
  ANNUAL: 360,
  SEMIANNUAL: 180,
  QUARTERLY: 90,
  BIMONTHLY: 60,
  MONTHLY: 30,
  BIWEEKLY: 15,
  DAILY: 1
};

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function computeNetPrice({ property_price, apply_bono, bono_amount }) {
  return property_price - (apply_bono ? bono_amount : 0);
}

function computeDownPayment({ net_price, down_payment_mode, down_payment_percent, down_payment_amount }) {
  if (down_payment_mode === "PERCENT") {
    return (net_price * down_payment_percent) / 100;
  }
  return down_payment_amount;
}

function periodToDays(period) {
  return PERIOD_DAYS_ORDINARY_YEAR[period];
}

function computeTermMonths({ term_value, term_unit }) {
  return term_unit === "YEARS" ? term_value * 12 : term_value;
}

export const rateSegmentInputSchema = z
  .object({
    from_period: z.number().int().min(1),
    to_period: z.number().int().min(1),
    rate_value: z.number().min(0).max(100)
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.to_period < data.from_period) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to_period"],
        message: "to_period no puede ser menor que from_period"
      });
    }

  });

export const createLoanPlanInputsSchema = z
  .object({
    simulation_id: z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{24}$/, { message: "simulation_id debe ser un ObjectId válido" }),

    currency: z.enum(["PEN", "USD"]),
    exchange_rate: z.number().positive().optional(),

    property_price: z.number().positive(),
    apply_bono: z.boolean(),
    bono_amount: z.number().min(0),
    net_price: z.number().positive().optional(),

    down_payment_mode: downPaymentModeEnum,
    down_payment_percent: z.number().min(0).max(100).optional(),
    down_payment_amount: z.number().min(0).optional(),

    loan_amount: z.number().positive().optional(),

    payment_frequency: periodEnum,
    term_value: z.number().int().positive(),
    term_unit: termUnitEnum,

    rate_mode: rateModeEnum,
    rate_kind: rateKindEnum,
    rate_period: periodEnum,
    capitalization: periodEnum.optional(),
    rate_segments: z.array(rateSegmentInputSchema).min(1),

    grace_mode: graceModeEnum.optional().default("NONE"),
    scotia_grace_days: z.number().int().min(0).optional(),
    grace_segments: z
      .array(
        z
          .object({
            grace_kind: graceKindEnum,
            from_period: z.number().int().min(1),
            to_period: z.number().int().min(1)
          })
          .strict()
          .superRefine((g, ctx) => {
            if (g.to_period < g.from_period) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["to_period"],
                message: "to_period no puede ser menor que from_period"
              });
            }
          })
      )
      .optional(),

    discount_rate_tea: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .describe("COK como TEA en porcentaje (ej: 10 = 10%)"),

    include_cashflows: z.boolean().optional().default(false)
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.currency === "USD" && !data.exchange_rate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exchange_rate"],
        message: "exchange_rate es obligatorio cuando currency es USD"
      });
    }

    if (!data.apply_bono && data.bono_amount !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bono_amount"],
        message: "bono_amount debe ser 0 cuando apply_bono es false"
      });
    }

    if (data.rate_kind === "NOMINAL" && !data.capitalization) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capitalization"],
        message: "capitalization es obligatorio cuando rate_kind es NOMINAL"
      });
    }

    if (data.down_payment_mode === "PERCENT") {
      if (typeof data.down_payment_percent !== "number" || data.down_payment_percent <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["down_payment_percent"],
          message: "down_payment_percent es obligatorio y debe ser > 0 cuando down_payment_mode es PERCENT"
        });
      }
    }

    if (data.down_payment_mode === "AMOUNT") {
      if (typeof data.down_payment_amount !== "number" || data.down_payment_amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["down_payment_amount"],
          message: "down_payment_amount es obligatorio y debe ser > 0 cuando down_payment_mode es AMOUNT"
        });
      }
    }

    const paymentDays = periodToDays(data.payment_frequency);
    if (!paymentDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payment_frequency"],
        message: "payment_frequency inválido"
      });
      return;
    }

    const termMonths = computeTermMonths(data);
    const totalDays = termMonths * 30;
    const totalPeriods = totalDays / paymentDays;
    if (!Number.isInteger(totalPeriods) || totalPeriods <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["term_value"],
        message: "term_value/term_unit no coincide con payment_frequency para obtener un número entero de periodos"
      });
    }

    const expectedNetPrice = roundTo(computeNetPrice(data), 7);

    const downPayment = computeDownPayment({
      net_price: expectedNetPrice,
      down_payment_mode: data.down_payment_mode,
      down_payment_percent: data.down_payment_percent ?? 0,
      down_payment_amount: data.down_payment_amount ?? 0
    });

    if (downPayment > expectedNetPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["down_payment_amount"],
        message: "La cuota inicial no puede ser mayor que el precio neto (property_price - bono_amount)"
      });
    }

    const expectedLoanAmount = roundTo(expectedNetPrice - downPayment, 7);

    if (typeof data.net_price === "number" && roundTo(data.net_price, 7) !== expectedNetPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["net_price"],
        message: `net_price no coincide con property_price - bono_amount (esperado: ${expectedNetPrice})`
      });
    }

    if (typeof data.loan_amount === "number" && roundTo(data.loan_amount, 7) !== expectedLoanAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["loan_amount"],
        message: `loan_amount no coincide con net_price - cuota_inicial (esperado: ${expectedLoanAmount})`
      });
    }

    const graceMode = data.grace_mode ?? "NONE";
    const graceSegments = Array.isArray(data.grace_segments) ? data.grace_segments : [];

    if (graceMode === "NONE") {
      // Ignora cualquier estructura de gracia
    } else if (graceMode === "SCOTIA_DAYS") {
      if (typeof data.scotia_grace_days !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scotia_grace_days"],
          message: "scotia_grace_days es obligatorio cuando grace_mode es SCOTIA_DAYS"
        });
      }
      if (graceSegments.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["grace_segments"],
          message: "grace_segments no aplica cuando grace_mode es SCOTIA_DAYS"
        });
      }
    } else if (graceMode === "CLASS_PERIODS") {
      if (typeof data.scotia_grace_days === "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scotia_grace_days"],
          message: "scotia_grace_days no aplica cuando grace_mode es CLASS_PERIODS"
        });
      }
      if (graceSegments.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["grace_segments"],
          message: "grace_segments es obligatorio cuando grace_mode es CLASS_PERIODS"
        });
      }

      const sortedGrace = [...graceSegments].sort((a, b) => a.from_period - b.from_period);
      for (let i = 0; i < sortedGrace.length; i++) {
        const g = sortedGrace[i];
        if (g.from_period > totalPeriods || g.to_period > totalPeriods) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["grace_segments", i],
            message: "El rango de gracia debe estar dentro del total de periodos"
          });
        }
        if (i > 0) {
          const prev = sortedGrace[i - 1];
          if (g.from_period <= prev.to_period) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["grace_segments", i, "from_period"],
              message: "Los periodos de gracia no pueden traslaparse"
            });
          }
        }
      }

      const lastGrace = sortedGrace[sortedGrace.length - 1];
      if (lastGrace && lastGrace.to_period === totalPeriods) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["grace_segments"],
          message:
            "El último periodo no puede ser de gracia (debe existir al menos un periodo normal para cerrar el saldo)"
        });
      }
    }

    const segmentsSorted = [...data.rate_segments].sort((a, b) => a.from_period - b.from_period);

    if (data.rate_mode === "CONSTANT") {
      if (segmentsSorted.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rate_segments"],
          message: "Si rate_mode es CONSTANT, rate_segments debe tener 1 solo segmento"
        });
        return;
      }

      const seg = segmentsSorted[0];
      if (seg.from_period !== 1 || seg.to_period !== totalPeriods) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rate_segments", 0],
          message: "Si rate_mode es CONSTANT, el segmento debe cubrir del periodo 1 hasta el último periodo"
        });
      }
      return;
    }

    if (data.rate_mode === "VARIABLE") {
      if (segmentsSorted[0]?.from_period !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rate_segments", 0, "from_period"],
          message: "El primer segmento de tasa debe iniciar en el periodo 1"
        });
      }

      for (let i = 0; i < segmentsSorted.length; i++) {
        const seg = segmentsSorted[i];
        if (seg.to_period > totalPeriods) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["rate_segments", i, "to_period"],
            message: "to_period no puede exceder el total de periodos"
          });
        }

        if (i > 0) {
          const prev = segmentsSorted[i - 1];
          if (seg.from_period !== prev.to_period + 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["rate_segments", i, "from_period"],
              message: "Los segmentos de tasa deben ser contiguos y sin traslape (from_period = prev.to_period + 1)"
            });
          }
        }
      }

      const last = segmentsSorted[segmentsSorted.length - 1];
      if (last && last.to_period !== totalPeriods) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rate_segments"],
          message: "Los segmentos de tasa deben cubrir hasta el último periodo"
        });
      }
      return;
    }
  });
