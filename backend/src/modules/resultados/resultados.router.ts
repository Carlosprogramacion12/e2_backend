import { Router, Request, Response, NextFunction } from 'express';
import { ResultadosService } from './resultados.service';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const resultadosService = new ResultadosService();

/**
 * @openapi
 * /api/admin/resultados:
 *   get:
 *     summary: Obtener el ranking de proyectos de un evento
 *     tags: [Resultados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: evento_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retorna el ranking ordenado, lista de eventos y evento actual
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventoId = req.query.evento_id ? parseInt(req.query.evento_id as string, 10) : undefined;
    const result = await resultadosService.getResultados(eventoId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/resultados/constancia/{proyectoId}/{posicion}:
 *   get:
 *     summary: Descargar constancia en PDF de un proyecto según su posición
 *     tags: [Resultados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proyectoId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: posicion
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archivo PDF (Fase 6)
 */
import { PdfService } from '../../utils/pdf.service';

router.get('/constancia/:proyectoId/:posicion', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proyectoId = parseInt(req.params.proyectoId as string, 10);
    const posicion = parseInt(req.params.posicion as string, 10);
    
    const metadata = await resultadosService.getDownloadMetadata(proyectoId, posicion);
    PdfService.generarConstancia(res, metadata as any);
  } catch (error) {
    next(error);
  }
});

export const resultadosRouter = router;
