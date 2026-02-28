import { Router } from "express";
import authController from "../controllers/AuthController.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../schemas/auth.schemas.js";

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar usuario
 *     tags:
 *       - Auth
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
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Perez
 *               username:
 *                 type: string
 *                 example: juanp
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juanp@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MiPasswordSegura123
 *     responses:
 *       201:
 *         description: Usuario registrado
 *       400:
 *         description: Error de validación
 */
router.post("/register", validate({ body: registerSchema }), (req, res, next) =>
    authController.register(req, res, next)
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juanp@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MiPasswordSegura123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "63f8c9e4f1a2b3c4d5e6f7g8"
 *                     name:
 *                       type: string
 *                       example: "Juan Perez"
 *                     username:
 *                       type: string
 *                       example: "juanp"
 *                     email:
 *                       type: string
 *                       example: "juanp@gmail.com"
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", validate({ body: loginSchema }), (req, res, next) =>
    authController.login(req, res, next)
);

export default router;
