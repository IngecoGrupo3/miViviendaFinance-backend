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
 *               - first_name
 *               - last_name
 *               - age
 *               - email
 *               - marital_status
 *               - monthly_income
 *               - income_type
 *               - dependents_count
 *               - employment_tenure_months
 *               - employment_status
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Juan
 *               last_name:
 *                 type: string
 *                 example: Perez
 *               age:
 *                 type: integer
 *                 example: 30
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@gmail.com
 *               phone:
 *                 type: string
 *                 example: "+51987654321"
 *               marital_status:
 *                 type: string
 *                 enum: [soltero, casado, divorciado, viudo, conviviente]
 *               monthly_income:
 *                 type: number
 *                 example: 5000
 *               income_type:
 *                 type: string
 *                 enum: [dependiente, independiente, mixto]
 *               dependents_count:
 *                 type: integer
 *                 example: 0
 *               employment_tenure_months:
 *                 type: integer
 *                 example: 24
 *               employment_status:
 *                 type: string
 *                 enum: [activo, desempleado, jubilado, independiente]
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
 *     summary: Listar clientes
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
 *               first_name:
 *                 type: string
 *                 example: Juan
 *               last_name:
 *                 type: string
 *                 example: Perez
 *               age:
 *                 type: integer
 *                 example: 30
 *               email:
 *                 type: string
 *                 example: juan@gmail.com
 *               phone:
 *                 type: string
 *                 example: "+51987654321"
 *               marital_status:
 *                 type: string
 *                 enum: [soltero, casado, divorciado, viudo, conviviente]
 *               monthly_income:
 *                 type: number
 *                 example: 5000
 *               income_type:
 *                 type: string
 *                 enum: [dependiente, independiente, mixto]
 *               dependents_count:
 *                 type: integer
 *                 example: 0
 *               employment_tenure_months:
 *                 type: integer
 *                 example: 24
 *               employment_status:
 *                 type: string
 *                 enum: [activo, desempleado, jubilado, independiente]
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

export default router;