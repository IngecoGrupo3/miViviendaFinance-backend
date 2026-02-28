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
 *                   full_name:
 *                     type: string
 *                     example: "Juan Perez"
 *                   identity_document:
 *                     type: string
 *                     example: "12345678"
 *                   email:
 *                     type: string
 *                     example: "juanp@gmail.com"
 *                   phone:
 *                     type: string
 *                     example: "+51987654321"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-02-28T12:34:56.789Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-02-28T12:34:56.789Z"
 *       400:
 *         description: Error de validación
 */
router.get("/", requireAuth, validate({ query: listUsersQuerySchema }), (req, res, next) =>
    userController.list(req, res, next)
);

export default router;