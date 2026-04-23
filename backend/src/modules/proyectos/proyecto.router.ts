import { Router, Request, Response, NextFunction } from 'express';
import { ProyectoService } from './proyecto.service';
import { ProyectoRepository } from './proyecto.repository';
import { createProyectoSchema, updateProyectoSchema } from './proyecto.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const proyectoService = new ProyectoService(new ProyectoRepository());

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
 * /api/admin/proyectos:
 *   get:
 *     summary: Listar todos los proyectos
 *     tags: [Proyectos]
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
 *         description: Lista paginada de proyectos
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    
    const search = req.query.search ? (req.query.search as string) : undefined;
    const evento_id = req.query.evento_id && !isNaN(parseInt(req.query.evento_id as string, 10)) ? parseInt(req.query.evento_id as string, 10) : undefined;
    
    const result = await proyectoService.getAllProyectos({ page, limit, search, evento_id });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/proyectos/{id}:
 *   get:
 *     summary: Obtener proyecto por ID
 *     tags: [Proyectos]
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
 *         description: Datos completos del proyecto con equipo y calificaciones
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await proyectoService.getProyectoById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/proyectos:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProyectoInput'
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 */
router.post('/', authMiddleware, validate(createProyectoSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await proyectoService.createProyecto(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/proyectos/{id}:
 *   put:
 *     summary: Actualizar datos de un proyecto
 *     tags: [Proyectos]
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
 *             $ref: '#/components/schemas/UpdateProyectoInput'
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 */
router.put('/:id', authMiddleware, validate(updateProyectoSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await proyectoService.updateProyecto(id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/proyectos/{id}:
 *   delete:
 *     summary: Eliminar un proyecto
 *     tags: [Proyectos]
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
 *         description: Proyecto eliminado
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await proyectoService.deleteProyecto(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const proyectoRouter = router;
