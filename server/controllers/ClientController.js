import * as clientService from "../services/client.service.js";

class ClientController {
  async create(req, res, next) {
    try {
      const result = await clientService.createClient(req.validated.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const result = await clientService.listClients();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const result = await clientService.updateClient(
        req.params.id,
        req.validated.body
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const result = await clientService.deleteClient(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default new ClientController();