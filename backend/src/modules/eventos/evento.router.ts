import { Router, Request, Response, NextFunction } from 'express';
import { EventoService } from './evento.service';
import { createEventoSchema, updateEventoSchema } from './evento.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

import { CriterioService } from '../criterios/criterio.service';
import { createCriterioSchema } from '../criterios/criterio.schema';

const router = Router();
const eventoService = new EventoService();
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
 * /api/admin/eventos:
 *   get:
 *     summary: Listar todos los eventos
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de eventos
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const result = await eventoService.getAllEventos({ page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/eventos/jueces/disponibles:
 *   get:
 *     summary: Obtener la lista de usuarios con el rol 'Juez' para asignarlos
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retorna lista de jueces
 */
router.get('/jueces/disponibles', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await eventoService.getAvailableJueces();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/eventos:
 *   post:
 *     summary: Crear un nuevo evento
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventoInput'
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 */
router.post('/', authMiddleware, validate(createEventoSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await eventoService.createEvento(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/eventos/{eventoId}/criterios:
 *   post:
 *     summary: Agregar un criterio de evaluación a un evento
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCriterioInput'
 *     responses:
 *       201:
 *         description: Criterio creado
 */
router.post('/:eventoId/criterios', authMiddleware, validate(createCriterioSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventoId = parseInt(req.params.eventoId as string, 10);
    const result = await criterioService.createCriterio({
      evento_id: eventoId,
      ...req.body
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/eventos/{id}:
 *   get:
 *     summary: Obtener evento por ID
 *     tags: [Eventos]
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
 *         description: Datos completos del evento con sus jueces y criterios
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await eventoService.getEventoById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/eventos/{id}:
 *   put:
 *     summary: Actualizar evento
 *     tags: [Eventos]
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
 *             $ref: '#/components/schemas/UpdateEventoInput'
 *     responses:
 *       200:
 *         description: Evento actualizado
 */
router.put('/:id', authMiddleware, validate(updateEventoSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await eventoService.updateEvento(id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/eventos/{id}:
 *   delete:
 *     summary: Eliminar un evento
 *     tags: [Eventos]
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
 *         description: Evento eliminado correctamente
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await eventoService.deleteEvento(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const eventoRouter = router;
