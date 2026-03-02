import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import clientRoutes from "./client.routes.js";
import housingRoutes from "./housing.routes.js";

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
router.use("/auth", authRoutes);
router.use("/clients", clientRoutes);
router.use("/housing", housingRoutes);

export default router;