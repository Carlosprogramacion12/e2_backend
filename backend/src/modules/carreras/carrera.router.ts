import { Router, Request, Response, NextFunction } from 'express';
import { CarreraService } from './carrera.service';
import { createCarreraSchema, updateCarreraSchema } from './carrera.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const carreraService = new CarreraService();

const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({ body: req.body });
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * @openapi
 * /api/admin/carreras:
 *   get:
 *     summary: Listar todas las carreras
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de carreras
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await carreraService.getAllCarreras();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/carreras/{id}:
 *   get:
 *     summary: Obtener carrera por ID
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la carrera
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await carreraService.getCarreraById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/carreras:
 *   post:
 *     summary: Crear una nueva carrera
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCarreraInput'
 *     responses:
 *       201:
 *         description: Carrera creada exitosamente
 */
router.post('/', authMiddleware, validate(createCarreraSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await carreraService.createCarrera(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/carreras/{id}:
 *   put:
 *     summary: Actualizar datos de una carrera
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCarreraInput'
 *     responses:
 *       200:
 *         description: Carrera actualizada
 */
router.put('/:id', authMiddleware, validate(updateCarreraSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await carreraService.updateCarrera(id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/carreras/{id}:
 *   delete:
 *     summary: Eliminar una carrera
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Carrera eliminada
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await carreraService.deleteCarrera(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const carreraRouter = router;
