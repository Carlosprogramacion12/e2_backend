import { Router, Request, Response, NextFunction } from 'express';
import { PerfilService } from './perfil.service';
import { createPerfilSchema, updatePerfilSchema } from './perfil.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const perfilService = new PerfilService();

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
 * /api/admin/perfiles:
 *   get:
 *     summary: Listar todos los perfiles de equipo
 *     tags: [Perfiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de perfiles
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await perfilService.getAllPerfiles();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/perfiles/{id}:
 *   get:
 *     summary: Obtener perfil por ID
 *     tags: [Perfiles]
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
 *         description: Datos del perfil
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await perfilService.getPerfilById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/perfiles:
 *   post:
 *     summary: Crear un nuevo perfil de equipo
 *     tags: [Perfiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePerfilInput'
 *     responses:
 *       201:
 *         description: Perfil creado exitosamente
 */
router.post('/', authMiddleware, validate(createPerfilSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await perfilService.createPerfil(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/perfiles/{id}:
 *   put:
 *     summary: Actualizar datos de un perfil de equipo
 *     tags: [Perfiles]
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
 *             $ref: '#/components/schemas/UpdatePerfilInput'
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.put('/:id', authMiddleware, validate(updatePerfilSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await perfilService.updatePerfil(id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/perfiles/{id}:
 *   delete:
 *     summary: Eliminar un perfil de equipo
 *     tags: [Perfiles]
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
 *         description: Perfil eliminado
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await perfilService.deletePerfil(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const perfilRouter = router;
