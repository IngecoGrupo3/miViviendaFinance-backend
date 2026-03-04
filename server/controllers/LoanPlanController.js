import { buildLoanPlanRatePreview } from "../services/loanPlan.service.js";
import * as loanPlanStorage from "../services/loanPlanStorage.service.js";

class LoanPlanController {
  async calculatePaymentSchedule(req, res, next) {
    try {
      const output = buildLoanPlanRatePreview(req.validated.body);
      const createdBy = req.auth?.sub;
      const persisted = await loanPlanStorage.persistLoanPlanCalculation({
        inputs: req.validated.body,
        output,
        createdBy
      });
      res.status(201).json({ ...persisted, ...output });
    } catch (err) {
      next(err);
    }
  }

  async listInputs(_req, res, next) {
    try {
      const result = await loanPlanStorage.listLoanPlanInputs();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getOutputByInputId(req, res, next) {
    try {
      const result = await loanPlanStorage.getLoanPlanOutputByInputId(req.validated.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getInputById(req, res, next) {
    try {
      const result = await loanPlanStorage.getLoanPlanInputById(req.validated.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default new LoanPlanController();  
