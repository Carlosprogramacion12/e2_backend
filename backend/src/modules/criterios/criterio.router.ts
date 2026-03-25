import { Router, Request, Response, NextFunction } from 'express';
import { CriterioService } from './criterio.service';
import { updateCriterioSchema } from './criterio.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const criterioService = new CriterioService();

// Validation Helper
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
 * /api/admin/criterios/{id}:
 *   get:
 *     summary: Obtener criterio por ID
 *     tags: [Criterios]
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
 *         description: Retorna los datos del criterio
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await criterioService.getCriterioById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/criterios/{id}:
 *   put:
 *     summary: Actualizar criterio
 *     tags: [Criterios]
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
 *             $ref: '#/components/schemas/UpdateCriterioInput'
 *     responses:
 *       200:
 *         description: Criterio actualizado correctamente
 */
router.put('/:id', authMiddleware, validate(updateCriterioSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await criterioService.updateCriterio(id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/criterios/{id}:
 *   delete:
 *     summary: Eliminar criterio
 *     tags: [Criterios]
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
 *         description: Criterio eliminado
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await criterioService.deleteCriterio(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const criterioRouter = router;
