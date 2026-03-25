import { Router, Request, Response, NextFunction } from 'express';
import { SolicitudService } from './solicitud.service';
import { crearSolicitudSchema } from './solicitud.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const solicitudService = new SolicitudService();

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
 * /api/participante/solicitudes/mis:
 *   get:
 *     summary: Historial de mis solicitudes enviadas
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes enviadas por el participante
 */
router.get('/mis', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await solicitudService.getMisSolicitudes(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/solicitudes/equipo/{equipoId}:
 *   get:
 *     summary: Solicitudes recibidas en el equipo
 *     tags: [Solicitudes]
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
 *         description: Lista de participantes que han enviado solicitud
 */
router.get('/equipo/:equipoId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const equipoId = parseInt(req.params.equipoId as string, 10);
    const result = await solicitudService.verSolicitudesEquipo(equipoId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/solicitudes/{equipoId}:
 *   post:
 *     summary: Enviar solicitud para unirse a un equipo
 *     tags: [Solicitudes]
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
 *             $ref: '#/components/schemas/CrearSolicitudInput'
 *     responses:
 *       201:
 *         description: Solicitud enviada exitosamente
 */
router.post('/:equipoId', authMiddleware, validate(crearSolicitudSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const equipoId = parseInt(req.params.equipoId as string, 10);
    const userId = Number(req.user.id);
    const result = await solicitudService.crearSolicitud(equipoId, userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/solicitudes/{id}/aceptar:
 *   post:
 *     summary: Aceptar una solicitud de equipo
 *     tags: [Solicitudes]
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
 *         description: Solicitud aceptada y participante agregado
 */
router.post('/:id/aceptar', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const userId = Number(req.user.id);
    const result = await solicitudService.aceptar(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/solicitudes/{id}/rechazar:
 *   post:
 *     summary: Rechazar una solicitud de equipo
 *     tags: [Solicitudes]
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
 *         description: Solicitud rechazada
 */
router.post('/:id/rechazar', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const userId = Number(req.user.id);
    const result = await solicitudService.rechazar(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const solicitudRouter = router;
