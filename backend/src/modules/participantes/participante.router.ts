import { Router, Request, Response, NextFunction } from 'express';
import { ParticipanteService } from './participante.service';
import { registroInicialSchema } from './participante.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const participanteService = new ParticipanteService();

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
 * /api/participante/dashboard:
 *   get:
 *     summary: Obtener el dashboard principal del participante
 *     tags: [Participante]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retorna los datos del equipo del participante, gráficos e invitaciones
 */
router.get('/dashboard', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await participanteService.getDashboardData(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/registro-inicial:
 *   get:
 *     summary: Obtener datos para el formulario de registro inicial (carreras)
 *     tags: [Participante]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de carreras y estado actual del participante
 */
router.get('/registro-inicial', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await participanteService.getRegistroInicialDatos(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/registro-inicial:
 *   post:
 *     summary: Crear o actualizar el perfil de participante
 *     tags: [Participante]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroInicialInput'
 *     responses:
 *       200:
 *         description: Perfil configurado
 */
router.post('/registro-inicial', authMiddleware, validate(registroInicialSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await participanteService.registroInicial(userId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/participante/constancia/{tipo}:
 *   get:
 *     summary: Descargar constancia de participación en PDF (Individual/Equipo)
 *     tags: [Participante]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [individual, equipo]
 *     responses:
 *       200:
 *         description: Archivo PDF (Fase 6)
 */
import { PdfService } from '../../utils/pdf.service';

router.get('/constancia/:tipo', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const tipo = req.params.tipo;

    // Aquí delegar al servicio para extraer la data, simulamos estructura
    // En producción `participanteService` recuperará estos datos de la BD.
    const metadata = {
      proyecto: { nombre: 'Proyecto Académico TS', equipo: { participantes: [] } },
      textoLogro: tipo === 'equipo' ? 'CONSTANCIA DE EQUIPO' : 'CONSTANCIA INDIVIDUAL',
      nombreTitular: req.user.name,
      mostrarIntegrantes: tipo === 'equipo',
      evento: { nombre: 'Evento de Evaluación 2026' }
    };

    PdfService.generarConstancia(res, metadata as any);
  } catch (error) {
    next(error);
  }
});

export const participanteRouter = router;
