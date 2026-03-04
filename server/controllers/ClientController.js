import * as clientService from "../services/client.service.js";
import Client from '../models/Client.js';

class ClientController {
  async create(req, res, next) {
    try {
      const userId = req.auth.sub; // from requireAuth middleware payload
      const result = await clientService.createClient(userId, req.validated.body);
      res.status(201).json(result);
    } catch (err) {
      if (err.code === 11000) {
        err.status = 400;
        err.message = "El DNI o Correo ya está registrado";
      }
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const userId = req.auth.sub;
      const result = await clientService.listClients(userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const userId = req.auth.sub;
      const result = await clientService.getClientById(req.params.id, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const userId = req.auth.sub;
      const result = await clientService.updateClient(
        req.params.id,
        userId,
        req.validated.body
      );
      res.json(result);
    } catch (err) {
      if (err.code === 11000) {
        err.status = 400;
        err.message = "El DNI o Correo ya está registrado";
      }
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const userId = req.auth.sub;
      const result = await clientService.deleteClient(req.params.id, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async assignHousing(clientId, housingId) {
    const client = await Client.findByIdAndUpdate(
      clientId,
      { assignedHousingId: housingId },
      { new: true } // Devuelve el documento actualizado
    );
  
    if (!client) {
      throw new Error("Cliente no encontrado");
    }

    return client;
  }
}

export default new ClientController();