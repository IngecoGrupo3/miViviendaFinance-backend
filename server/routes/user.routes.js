import { Router } from "express";
import userController from "../controllers/UserController.js";
import { validate } from "../middleware/validate.js";
import { listUsersQuerySchema } from "../schemas/user.schemas.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Listar usuarios
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "63f8c9e4f1a2b3c4d5e6f7g8"
 *                   name:
 *                     type: string
 *                     example: "Juan Perez"
 *                   username:
 *                     type: string
 *                     example: "juanp"
 *                   email:
 *                     type: string
 *                     example: "juanp@gmail.com"
 *       400:
 *         description: Error de validación
 */
router.get("/", requireAuth, validate({ query: listUsersQuerySchema }), (req, res, next) =>
    userController.list(req, res, next)
);

export default router;