import * as housingService from "../services/housing.service.js";

class HousingController {
  async create(req, res, next) {
    try {
      const userId = req.auth.sub; // Obtener userId del token
      const result = await housingService.createHousing(req.validated.body, userId);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      //const userId = req.auth.sub; // Obtener userId del token
      const result = await housingService.listHousing();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await housingService.getHousingById(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const userId = req.auth.sub; // Obtener userId del token
      const result = await housingService.updateHousing(
        req.params.id,
        req.validated.body,
        userId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const userId = req.auth.sub; // Obtener userId del token
      const result = await housingService.deleteHousing(req.params.id, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default new HousingController();