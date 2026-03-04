import { Router } from "express";
import clientController from "../controllers/ClientController.js";
import { validate } from "../middleware/validate.js";
import { assignHousingParamsSchema, createClientSchema, updateClientSchema } from "../schemas/client.schemas.js";
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
 *               - firstName
 *               - lastName
 *               - dni
 *               - age
 *               - email
 *               - phone
 *               - maritalStatus
 *               - monthlyIncome
 *               - incomeType
 *               - dependentsCount
 *               - employmentTenureMonths
 *               - employmentStatus
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: PÃ©rez
 *               dni:
 *                 type: string
 *                 pattern: '^[0-9]{8}$'
 *                 example: "12345678"
 *                 description: DNI de 8 dÃ­gitos
 *               age:
 *                 type: integer
 *                 minimum: 18
 *                 example: 30
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan.perez@example.com
 *               phone:
 *                 type: string
 *                 example: "987654321"
 *               maritalStatus:
 *                 type: string
 *                 enum: [soltero, casado, divorciado, viudo, conviviente]
 *                 example: soltero
 *               monthlyIncome:
 *                 type: number
 *                 minimum: 0
 *                 example: 3500
 *               incomeType:
 *                 type: string
 *                 enum: [dependiente, independiente, mixto]
 *                 example: dependiente
 *               dependentsCount:
 *                 type: integer
 *                 minimum: 0
 *                 example: 0
 *               employmentTenureMonths:
 *                 type: integer
 *                 minimum: 0
 *                 example: 24
 *               employmentStatus:
 *                 type: string
 *                 minLength: 2
 *                 example: Empleado a tiempo completo
 *     responses:
 *       201:
 *         description: Cliente creado 
 *       400:
 *         description: Error de validaciÃ³n
 */
router.post("/", requireAuth, validate({ body: createClientSchema }), (req, res, next) =>
  clientController.create(req, res, next)
);

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
 *               firstName:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: PÃ©rez
 *               dni:
 *                 type: string
 *                 pattern: '^[0-9]{8}$'
 *                 example: "12345678"
 *               age:
 *                 type: integer
 *                 minimum: 18
 *                 example: 30
 *               email:
 *                 type: string
 *                 example: juan.perez@example.com
 *               phone:
 *                 type: string
 *                 example: "987654321"
 *               maritalStatus:
 *                 type: string
 *                 enum: [soltero, casado, divorciado, viudo, conviviente]
 *                 example: soltero
 *               monthlyIncome:
 *                 type: number
 *                 example: 3500
 *               incomeType:
 *                 type: string
 *                 enum: [dependiente, independiente, mixto]
 *                 example: dependiente
 *               dependentsCount:
 *                 type: integer
 *                 example: 0
 *               employmentTenureMonths:
 *                 type: integer
 *                 example: 24
 *               employmentStatus:
 *                 type: string
 *                 example: Empleado
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       404:
 *         description: Cliente no encontrado
 */
router.put("/:id", requireAuth, validate({ body: updateClientSchema }), (req, res, next) =>
  clientController.update(req, res, next)
);

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
 *     summary: Crear simulaciÃ³n (cliente + vivienda)
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
 *         description: SimulaciÃ³n creada exitosamente
 *       404:
 *         description: Cliente o vivienda no encontrados
 */
router.post(
  "/:id/assign-housing/:housingId",
  requireAuth,
  validate({ params: assignHousingParamsSchema }),
  (req, res, next) => clientController.assignHousing(req, res, next)
);

export default router;

