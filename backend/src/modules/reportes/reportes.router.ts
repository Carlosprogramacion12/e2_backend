import { Router } from 'express';
import { reportesService } from './reportes.service';

const router = Router();

/**
 * @swagger
 * /api/admin/reportes:
 *   get:
 *     summary: Obtener estadísticas generales para la vista de reportes
 *     tags: [Reportes]
 */
router.get('/', async (req, res, next) => {
  try {
    const stats = await reportesService.getGeneralStats();
    res.json({ status: 'success', data: stats });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/admin/reportes/usuarios/pdf:
 *   get:
 *     summary: Generar PDF de todos los usuarios
 *     tags: [Reportes]
 */
router.get('/usuarios/pdf', async (req, res, next) => {
  try {
    await reportesService.generateUsuariosPdf(res);
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/admin/reportes/equipos/pdf:
 *   get:
 *     summary: Generar PDF de todos los equipos
 *     tags: [Reportes]
 */
router.get('/equipos/pdf', async (req, res, next) => {
  try {
    await reportesService.generateEquiposPdf(res);
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/admin/reportes/eventos/pdf:
 *   get:
 *     summary: Generar PDF de todos los eventos
 *     tags: [Reportes]
 */
router.get('/eventos/pdf', async (req, res, next) => {
  try {
    await reportesService.generateEventosPdf(res);
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/admin/reportes/proyectos/pdf:
 *   get:
 *     summary: Generar PDF de todos los proyectos
 *     tags: [Reportes]
 */
router.get('/proyectos/pdf', async (req, res, next) => {
  try {
    await reportesService.generateProyectosPdf(res);
  } catch (error) { next(error); }
});

export const reportesRouter = router;
