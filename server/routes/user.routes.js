import { Router } from "express";
import userController from "../controllers/UserController.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema, listUsersQuerySchema } from "../schemas/user.schemas.js";

const router = Router();

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Crear usuario
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Juan Perez
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 example: juanp
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juanp@gmail.com
 *           example:
 *             name: Juan Perez
 *             username: juanp
 *             email: juanp@gmail.com
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Error de validación
 */
router.post("/", validate({ body: createUserSchema }), (req, res, next) =>
    userController.create(req, res, next)
);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Listar usuarios
 *     tags:
 *       - Users
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
router.get("/", validate({ query: listUsersQuerySchema }), (req, res, next) =>
    userController.list(req, res, next)
);

export default router;