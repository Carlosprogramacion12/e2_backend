import { Router, Request, Response, NextFunction } from 'express';
import { ConstanciaService } from './constancias.service';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const constanciaService = new ConstanciaService();

/**
 * @openapi
 * /api/admin/constancias:
 *   get:
 *     summary: Obtener todas las constancias guardadas (Solo lectura del registro CRUD)
 *     tags: [Constancias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de constancias del sistema
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await constanciaService.getAllConstancias();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/constancias/{id}:
 *   get:
 *     summary: Obtener una constancia por ID
 *     tags: [Constancias]
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
 *         description: Detalle de constancia
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await constanciaService.getConstanciaById(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const constanciaRouter = router;
