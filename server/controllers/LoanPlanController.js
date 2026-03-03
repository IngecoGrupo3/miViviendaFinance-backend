import { buildLoanPlanRatePreview } from "../services/loanPlan.service.js";

class LoanPlanController {
  async previewPaymentSchedule(req, res, next) {
    try {
      const result = buildLoanPlanRatePreview(req.validated.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default new LoanPlanController();
