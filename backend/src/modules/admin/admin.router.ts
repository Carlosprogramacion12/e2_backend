import { Router, Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { savePreferencesSchema } from './admin.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const adminService = new AdminService();

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
 * /api/admin/dashboard:
 *   get:
 *     summary: Obtener datos y métricas para el dashboard de administrador
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retorna estadísticas agrupadas y configuraciones de widgets
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await adminService.getDashboardData(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/dashboard/preferences:
 *   post:
 *     summary: Guardar preferencias de widgets del dashboard del usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SavePreferencesInput'
 *     responses:
 *       200:
 *         description: Preferencias guardadas correctamente
 */
router.post('/preferences', authMiddleware, validate(savePreferencesSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await adminService.savePreferences(userId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/dashboard/report:
 *   get:
 *     summary: Generar reporte en PDF del dashboard (Pendiente fase 6)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archivo PDF
 */
import { PdfService } from '../../utils/pdf.service';

router.get('/report', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const data = await adminService.getDashboardData(userId);
    PdfService.generarReporteDashboard(res, data.data);
  } catch (error) {
    next(error);
  }
});

export const adminRouter = router;
