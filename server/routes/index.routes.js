import { Router } from "express";
import userRoutes from "./user.routes.js";

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: API en funcionamiento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get("/health", (_req, res) => res.json({ status: "ok" }));

router.use("/users", userRoutes);

export default router;