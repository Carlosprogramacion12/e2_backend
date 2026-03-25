import { Router, Request, Response, NextFunction } from 'express';
import { AvanceService } from './avance.service';
import { storeAvanceSchema } from './avance.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const avanceService = new AvanceService();

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
 * /api/participante/avances:
 *   get:
 *     summary: Lista los avances (bitácora) del proyecto del participante respectivo
 *     tags: [Avances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de avances del proyecto
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await avanceService.getAvances(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/avances:
 *   post:
 *     summary: Registra un nuevo avance en la bitácora del proyecto
 *     tags: [Avances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreAvanceInput'
 *     responses:
 *       201:
 *         description: Avance registrado correctamente
 */
router.post('/', authMiddleware, validate(storeAvanceSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await avanceService.storeAvance(userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/avances/{id}:
 *   delete:
 *     summary: Elimina un avance de la bitácora por ID
 *     tags: [Avances]
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
 *         description: Avance borrado satisfactoriamente
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await avanceService.destroyAvance(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const avanceRouter = router;
