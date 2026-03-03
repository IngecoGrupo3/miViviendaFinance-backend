import { buildLoanPlanRatePreview } from "../services/loanPlan.service.js";

class LoanPlanController {
  async previewPaymentSchedule(req, res, next) {
    try {
      if (req.validated.body.rate_mode !== "CONSTANT") {
        const err = new Error("Por ahora el cronograma solo está implementado para rate_mode CONSTANT");
        err.status = 400;
        throw err;
      }
      const result = buildLoanPlanRatePreview(req.validated.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default new LoanPlanController();
