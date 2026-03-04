import { Router } from "express";
import clientController from "../controllers/ClientController.js";
import { validate } from "../middleware/validate.js";
import { createClientSchema, updateClientSchema } from "../schemas/client.schemas.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

/**
 * @openapi
 * /api/clients:
 *   post:
 *     summary: Crear cliente
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombres
 *               - apellidos
 *               - edad
 *               - dni
 *               - correo
 *               - telefono
 *               - estadoCivil
 *               - ingresosMensuales
 *               - tipoIngreso
 *               - dependientes
 *               - antiguedadLaboral
 *               - situacionLaboral
 *             properties:
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               edad:
 *                 type: integer
 *               dni:
 *                 type: string
 *               correo:
 *                 type: string
 *               telefono:
 *                 type: string
 *               estadoCivil:
 *                 type: string
 *                 enum: [soltero, casado, divorciado, viudo, conviviente]
 *               ingresosMensuales:
 *                 type: number
 *               tipoIngreso:
 *                 type: string
 *                 enum: [dependiente, independiente, mixto]
 *               dependientes:
 *                 type: integer
 *               antiguedadLaboral:
 *                 type: integer
 *               situacionLaboral:
 *                 type: string
 *                 enum: [estable, contrato, independiente, otro]
 *     responses:
 *       201:
 *         description: Cliente creado 
 *       400:
 *         description: Error de validación
 */
router.post("/", requireAuth, validate({ body: createClientSchema }), (req, res, next) => clientController.create(req, res, next));

/**
 * @openapi
 * /api/clients:
 *   get:
 *     summary: Listar clientes del agente logueado
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get("/", requireAuth, (req, res, next) => clientController.list(req, res, next));

/**
 * @openapi
 * /api/clients/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get("/:id", requireAuth, (req, res, next) => clientController.getById(req, res, next));

/**
 * @openapi
 * /api/clients/{id}:
 *   put:
 *     summary: Editar cliente
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               edad:
 *                 type: integer
 *               dni:
 *                 type: string
 *               correo:
 *                 type: string
 *               telefono:
 *                 type: string
 *               estadoCivil:
 *                 type: string
 *                 enum: [soltero, casado, divorciado, viudo, conviviente]
 *               ingresosMensuales:
 *                 type: number
 *               tipoIngreso:
 *                 type: string
 *                 enum: [dependiente, independiente, mixto]
 *               dependientes:
 *                 type: integer
 *               antiguedadLaboral:
 *                 type: integer
 *               situacionLaboral:
 *                 type: string
 *                 enum: [estable, contrato, independiente, otro]
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       404:
 *         description: Cliente no encontrado
 */
router.put("/:id", requireAuth, validate({ body: updateClientSchema }), (req, res, next) => clientController.update(req, res, next));

/**
 * @openapi
 * /api/clients/{id}:
 *   delete:
 *     summary: Eliminar cliente
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente eliminado
 *       404:
 *         description: Cliente no encontrado
 */
router.delete("/:id", requireAuth, (req, res, next) => clientController.remove(req, res, next));

/**
 * @openapi
 * /api/clients/{id}/assign-housing/{housingId}:
 *   post:
 *     summary: Asignar vivienda a un cliente
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: housingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vivienda asignada exitosamente
 *       404:
 *         description: Cliente o vivienda no encontrados
 */
router.post("/:id/assign-housing/:housingId", requireAuth, (req, res, next) => clientController.assignHousing(req, res, next));

export default router;