import { Router } from "express";
import loanPlanController from "../controllers/LoanPlanController.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { createLoanPlanInputsSchema } from "../schemas/loanPlan.schemas.js";

const router = Router();

/**
 * @openapi
 * /api/loan-plans/payment-schedule/preview:
 *   post:
 *     summary: Preview inputs para cronograma de pagos (solo validación + orden)
 *     tags:
 *       - LoanPlans
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Por ahora no se calcula el cronograma completo ni se persiste en BD.
 *       Se validan todos los inputs y se devuelve:
 *       - Monto del préstamo calculado (precio - bono - cuota inicial)
 *       - Tasas convertidas a TE del periodo de pago (payment_frequency), asumiendo año ordinario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - simulation_id
 *               - currency
 *               - property_price
 *               - apply_bono
 *               - bono_amount
 *               - down_payment_mode
 *               - payment_frequency
 *               - term_value
 *               - term_unit
 *               - rate_mode
 *               - rate_kind
 *               - rate_period
 *               - rate_segments
 *             properties:
 *               simulation_id:
 *                 type: string
 *                 example: "65e36f4d2f9b8c4a1a2b3c4d"
 *               currency:
 *                 type: string
 *                 enum: [PEN, USD]
 *                 example: PEN
 *               exchange_rate:
 *                 type: number
 *                 example: 3.75
 *               property_price:
 *                 type: number
 *                 example: 250000
 *               apply_bono:
 *                 type: boolean
 *                 example: true
 *               bono_amount:
 *                 type: number
 *                 example: 30000
 *               net_price:
 *                 type: number
 *                 description: Opcional (si lo envías, se valida contra el cálculo)
 *                 example: 220000
 *               down_payment_mode:
 *                 type: string
 *                 enum: [PERCENT, AMOUNT]
 *                 example: PERCENT
 *               down_payment_percent:
 *                 type: number
 *                 description: Obligatorio si down_payment_mode es PERCENT
 *                 example: 10
 *               down_payment_amount:
 *                 type: number
 *                 description: Obligatorio si down_payment_mode es AMOUNT
 *                 example: 0
 *               loan_amount:
 *                 type: number
 *                 description: Opcional (si lo envías, se valida contra el cálculo)
 *                 example: 195000
 *               payment_frequency:
 *                 type: string
 *                 enum: [ANNUAL, SEMIANNUAL, QUARTERLY, BIMONTHLY, MONTHLY, BIWEEKLY, DAILY]
 *                 example: SEMIANNUAL
 *               term_value:
 *                 type: integer
 *                 example: 5
 *               term_unit:
 *                 type: string
 *                 enum: [YEARS, MONTHS]
 *                 example: YEARS
 *               rate_mode:
 *                 type: string
 *                 enum: [CONSTANT, VARIABLE]
 *                 example: VARIABLE
 *               rate_kind:
 *                 type: string
 *                 enum: [EFFECTIVE, NOMINAL]
 *                 example: NOMINAL
 *               rate_period:
 *                 type: string
 *                 enum: [ANNUAL, SEMIANNUAL, QUARTERLY, BIMONTHLY, MONTHLY, BIWEEKLY, DAILY]
 *                 example: ANNUAL
 *               capitalization:
 *                 type: string
 *                 enum: [ANNUAL, SEMIANNUAL, QUARTERLY, BIMONTHLY, MONTHLY, BIWEEKLY, DAILY]
 *                 description: Obligatorio si rate_kind es NOMINAL
 *                 example: DAILY
 *               rate_segments:
 *                 type: array
 *                 description: |
 *                   Segmentos de tasa por periodo de pago.
 *                   Si rate_mode es CONSTANT: enviar 1 segmento que cubra del 1 al último periodo.
 *                   Si rate_mode es VARIABLE: enviar N segmentos contiguos que cubran del 1 al último periodo.
 *                 items:
 *                   type: object
 *                   required: [from_period, to_period, rate_value]
 *                   properties:
 *                     from_period:
 *                       type: integer
 *                       example: 1
 *                     to_period:
 *                       type: integer
 *                       example: 2
 *                     rate_value:
 *                       type: number
 *                       example: 15
 *               grace_mode:
 *                 type: string
 *                 enum: [NONE, SCOTIA_DAYS, CLASS_PERIODS]
 *                 example: NONE
 *               scotia_grace_days:
 *                 type: integer
 *                 description: Obligatorio si grace_mode es SCOTIA_DAYS
 *                 example: 30
 *               grace_segments:
 *                 type: array
 *                 description: Segmentos de gracia por periodo (solo si grace_mode es CLASS_PERIODS)
 *                 items:
 *                   type: object
 *                   required: [grace_kind, from_period, to_period]
 *                   properties:
 *                     grace_kind:
 *                       type: string
 *                       enum: [TOTAL, PARTIAL]
 *                       example: TOTAL
 *                     from_period:
 *                       type: integer
 *                       example: 1
 *                     to_period:
 *                       type: integer
 *                       example: 6
 *               discount_rate_tea:
 *                 type: number
 *                 description: "COK como TEA en porcentaje (ej: 10 = 10%)"
 *                 example: 10
 *               include_cashflows:
 *                 type: boolean
 *                 description: Si true, devuelve también cashflows [CF0..CFn]
 *                 example: false
 *               charges:
 *                 type: object
 *                 description: "Capa extra (seguros, comisiones, ITF). No amortiza capital."
 *                 properties:
 *                   insurance:
 *                     type: object
 *                     properties:
 *                       desgravamen:
 *                         type: object
 *                         properties:
 *                           enabled: { type: boolean, example: true }
 *                           monthly_rate: { type: number, example: 0.00035 }
 *                       bien:
 *                         type: object
 *                         properties:
 *                           enabled: { type: boolean, example: true }
 *                           monthly_rate: { type: number, example: 0.00025 }
 *                           insured_value: { type: number, example: 160000 }
 *                   fees:
 *                     type: object
 *                     properties:
 *                       physical_statement:
 *                         type: object
 *                         properties:
 *                           enabled: { type: boolean, example: true }
 *                           amount: { type: number, example: 11 }
 *                   itf:
 *                     type: object
 *                     properties:
 *                       enabled: { type: boolean, example: true }
 *                       rate: { type: number, example: 0.00005 }
 *     responses:
 *       200:
 *         description: Preview de tasas (convertidas al periodo de pago) + monto del préstamo + cronograma (solo CONSTANT)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loan_amount:
 *                   type: number
 *                   example: 195000
 *                 total_periods:
 *                   type: integer
 *                   example: 10
 *                 payment_frequency:
 *                   type: string
 *                   example: SEMIANNUAL
 *                 rate_mode:
 *                   type: string
 *                   example: VARIABLE
 *                 rates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       from_period:
 *                         type: integer
 *                         example: 1
 *                       to_period:
 *                         type: integer
 *                         example: 2
 *                       periods_count:
 *                         type: integer
 *                         example: 2
 *                       effective_rate_payment_period_percent:
 *                         type: number
 *                         example: 12.6825
 *                 payment_schedule:
 *                   type: object
 *                   description: |
 *                     Para rate_mode CONSTANT: incluye ted/ip/base_payment_amount + rows.
 *                     Para rate_mode VARIABLE: incluye segments + rows (la cuota se recalcula al inicio de cada segmento).
 *                   properties:
 *                     ted:
 *                       type: number
 *                       example: 0.0003856
 *                     ip:
 *                       type: number
 *                       example: 0.0674389
 *                     base_payment_amount:
 *                       type: number
 *                       example: 13245.1234567
 *                     rows:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period_number:
 *                             type: integer
 *                             example: 1
 *                           starting_balance:
 *                             type: number
 *                             example: 195000
 *                           payment_amount:
 *                             type: number
 *                             example: 13245.1234567
 *                           interest_amount:
 *                             type: number
 *                             example: 1123.456789
 *                           amortization_amount:
 *                             type: number
 *                             example: 12121.6666677
 *                           ending_balance:
 *                             type: number
 *                             example: 182878.3333323
 *                           base_payment_amount:
 *                             type: number
 *                             example: 13245.1234567
 *                           insurance_desgravamen_amount:
 *                             type: number
 *                             example: 31.5
 *                           insurance_bien_amount:
 *                             type: number
 *                             example: 22.5
 *                           fee_physical_statement_amount:
 *                             type: number
 *                             example: 11
 *                           charges_subtotal_amount:
 *                             type: number
 *                             example: 65
 *                           total_without_itf_amount:
 *                             type: number
 *                             example: 13310.1234567
 *                           itf_amount:
 *                             type: number
 *                             example: 0.6655062
 *                           total_payment_amount:
 *                             type: number
 *                             example: 13310.7889629
 *                 indicators:
 *                   type: object
 *                   properties:
 *                     tir_periodic:
 *                       type: number
 *                       nullable: true
 *                       example: 0.0778673
 *                     tcea_annual:
 *                       type: number
 *                       nullable: true
 *                       example: 0.1618054
 *                     van:
 *                       type: number
 *                       nullable: true
 *                       example: 1234.56789
 *                     k_periods_per_year:
 *                       type: number
 *                       example: 2
 *                     discount_rate_periodic:
 *                       type: number
 *                       nullable: true
 *                       example: 0.0465361
 *                 cashflows:
 *                   type: array
 *                   description: Solo si include_cashflows=true
 *                   items:
 *                     type: number
 *       400:
 *         description: Error de validación
 */
router.post(
  "/payment-schedule/preview",
  requireAuth,
  validate({ body: createLoanPlanInputsSchema }),
  (req, res, next) => loanPlanController.previewPaymentSchedule(req, res, next)
);

export default router;
