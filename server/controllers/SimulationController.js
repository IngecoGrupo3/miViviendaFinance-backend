import * as simulationService from "../services/simulation.service.js";

class SimulationController {
  async getIdsById(req, res, next) {
    try {
      const result = await simulationService.getSimulationIdsById(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default new SimulationController();
