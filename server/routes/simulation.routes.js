import { Router } from "express";
import simulationController from "../controllers/SimulationController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { objectIdParamsSchema } from "../schemas/loanPlan.schemas.js";

const router = Router();

/**
 * @openapi
 * /api/simulations/{id}:
 *   get:
 *     summary: Obtener clientId y housingId por simulation id
 *     tags:
 *       - Simulations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "69a7b80d4f983d53f47232c2"
 *     responses:
 *       200:
 *         description: IDs encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 simulation_id:
 *                   type: string
 *                   example: "69a7b80d4f983d53f47232c2"
 *                 clientId:
 *                   type: string
 *                   example: "69a7a43c2df1570bc707339c"
 *                 housingId:
 *                   type: string
 *                   example: "69a7b7fa4f983d53f47232ba"
 *       404:
 *         description: No encontrado
 */
router.get(
  "/:id",
  requireAuth,
  validate({ params: objectIdParamsSchema }),
  (req, res, next) => simulationController.getIdsById(req, res, next)
);

export default router;
