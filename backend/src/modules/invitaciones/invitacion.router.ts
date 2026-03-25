import { Router, Request, Response, NextFunction } from 'express';
import { InvitacionService } from './invitacion.service';
import { crearInvitacionSchema } from './invitacion.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const invitacionService = new InvitacionService();

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
 * /api/participante/invitaciones/mis:
 *   get:
 *     summary: Historial de invitaciones recibidas por el participante
 *     tags: [Invitaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de invitaciones pendientes y previas
 */
router.get('/mis', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await invitacionService.getMisInvitaciones(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/equipos/{equipoId}/invitar:
 *   post:
 *     summary: Enviar una invitación a otro participante para unirse al equipo
 *     tags: [Invitaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equipoId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearInvitacionInput'
 *     responses:
 *       201:
 *         description: Invitación enviada
 */
router.post('/equipo/:equipoId', authMiddleware, validate(crearInvitacionSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const equipoId = parseInt(req.params.equipoId as string, 10);
    const userId = Number(req.user.id);
    const result = await invitacionService.enviarInvitacion(equipoId, userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/equipos/{equipoId}/invitaciones-enviadas:
 *   get:
 *     summary: Ver todas las invitaciones mandadas a otros por el equipo
 *     tags: [Invitaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equipoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de invitaciones enviadas y sus estados
 */
router.get('/equipo/:equipoId/enviadas', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const equipoId = parseInt(req.params.equipoId as string, 10);
    const result = await invitacionService.getInvitacionesEnviadas(equipoId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/invitaciones/{id}/aceptar:
 *   post:
 *     summary: Aceptar una invitación a un equipo
 *     tags: [Invitaciones]
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
 *         description: Invitación aceptada exitosamente
 */
router.post('/:id/aceptar', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await invitacionService.aceptar(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/invitaciones/{id}/rechazar:
 *   post:
 *     summary: Rechazar una invitación a un equipo
 *     tags: [Invitaciones]
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
 *         description: Invitación rechazada
 */
router.post('/:id/rechazar', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await invitacionService.rechazar(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const invitacionRouter = router;
