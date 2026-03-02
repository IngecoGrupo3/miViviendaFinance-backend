import { Router } from "express";
import housingController from "../controllers/housing.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createHousingSchema,
  updateHousingSchema
} from "../schemas/housing.schemas.js";

const router = Router();

/**
 * @openapi
 * /api/housing:
 *   post:
 *     summary: Crear vivienda
 *     tags:
 *       - Housing
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Vivienda creada correctamente
 *       400:
 *         description: Error de validación
 */
router.post(
  "/",
  requireAuth,
  validate({ body: createHousingSchema }),
  (req, res, next) => housingController.create(req, res, next)
);

/**
 * @openapi
 * /api/housing:
 *   get:
 *     summary: Listar viviendas
 *     tags:
 *       - Housing
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de viviendas
 */
router.get(
  "/",
  requireAuth,
  (req, res, next) => housingController.list(req, res, next)
);

/**
 * @openapi
 * /api/housing/{id}:
 *   get:
 *     summary: Obtener vivienda por ID
 *     tags:
 *       - Housing
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id",
  requireAuth,
  (req, res, next) => housingController.getById(req, res, next)
);

/**
 * @openapi
 * /api/housing/{id}:
 *   put:
 *     summary: Actualizar vivienda
 *     tags:
 *       - Housing
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  requireAuth,
  validate({ body: updateHousingSchema }),
  (req, res, next) => housingController.update(req, res, next)
);

/**
 * @openapi
 * /api/housing/{id}:
 *   delete:
 *     summary: Eliminar vivienda
 *     tags:
 *       - Housing
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  requireAuth,
  (req, res, next) => housingController.remove(req, res, next)
);

export default router;