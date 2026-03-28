import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../utils/prisma';

const router = Router();

/**
 * @swagger
 * /api/participante/dashboard:
 *   get:
 *     summary: Obtener datos del dashboard del participante
 *     tags: [Participante]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // 1. Get user info (carrera etc)
    const user = await prisma.users.findUnique({ where: { id: BigInt(userId) } });
    const registrado = !!user?.carrera;

    let equipo: any = null;
    let proyecto: any = null;
    let miembros: any[] = [];
    let puntajeTotal = 0;
    let chartLabels: string[] = [];
    let chartData: number[] = [];
    let evento_inscrito: any = null;

    // 2. Find team via equipo_miembros
    const membership = await prisma.equipo_miembros.findFirst({
      where: { user_id: BigInt(userId) },
      include: { equipos: true }
    });

    if (membership) {
      equipo = {
        id: Number(membership.equipos.id),
        nombre: membership.equipos.nombre
      };

      // 3. Get team members
      const miembrosData = await prisma.equipo_miembros.findMany({
        where: { equipo_id: membership.equipo_id },
        include: { users: { select: { id: true, name: true } } }
      });
      miembros = miembrosData.map(m => ({
        id: Number(m.users.id),
        nombre: m.users.name,
        perfil: m.rol || 'Miembro',
        es_lider: m.rol === 'LIDER'
      }));

      // 4. Find the team's project
      const proyectoData = await prisma.proyectos.findFirst({
        where: { equipo_id: membership.equipo_id },
        include: { eventos: true }
      });

      if (proyectoData) {
        proyecto = {
          id: Number(proyectoData.id),
          nombre: proyectoData.nombre,
          descripcion: proyectoData.descripcion,
          repositorio_url: proyectoData.repositorio_url || null,
          evento_id: Number(proyectoData.evento_id)
        };

        // 5. Get scores by criteria
        const evaluaciones = await prisma.evaluaciones.findMany({
          where: { proyecto_id: proyectoData.id },
          include: { evaluacion_criterios: true }
        });

        const scoresByCriteria: Record<string, { sum: number; count: number }> = {};
        for (const ev of evaluaciones) {
          const nombre = ev.evaluacion_criterios?.nombre || 'Criterio';
          if (!scoresByCriteria[nombre]) {
            scoresByCriteria[nombre] = { sum: 0, count: 0 };
          }
          scoresByCriteria[nombre].sum += Number(ev.puntuacion);
          scoresByCriteria[nombre].count += 1;
        }

        chartLabels = Object.keys(scoresByCriteria);
        chartData = chartLabels.map(label => {
          const s = scoresByCriteria[label];
          return s.count > 0 ? Math.round(s.sum / s.count) : 0;
        });
        puntajeTotal = chartData.length > 0
          ? Math.round(chartData.reduce((a, b) => a + b, 0) / chartData.length)
          : 0;

        // 6. Event info
        if (proyectoData.eventos) {
          evento_inscrito = {
            id: Number(proyectoData.eventos.id),
            nombre: proyectoData.eventos.nombre,
            descripcion: proyectoData.eventos.descripcion,
            fecha_inicio: proyectoData.eventos.fecha_inicio,
            fecha_fin: proyectoData.eventos.fecha_fin
          };
        }
      }
    }

    // 7. Pending invitations (equipo_interacciones with tipo=INVITACION and estado=PENDIENTE)
    let invitaciones: any[] = [];
    const invRows = await prisma.equipo_interacciones.findMany({
      where: {
        user_id: BigInt(userId),
        tipo: 'INVITACION',
        estado: 'PENDIENTE'
      },
      include: { equipos: true }
    });
    invitaciones = invRows.map((inv: any) => ({
      id: Number(inv.id),
      equipo: { id: Number(inv.equipos.id), nombre: inv.equipos.nombre },
      rol: 'Miembro',
      estado: inv.estado
    }));

    // 8. Upcoming events
    const eventosData = await prisma.eventos.findMany({
      where: { fecha_fin: { gte: new Date() } },
      orderBy: { fecha_inicio: 'asc' },
      take: 5
    });
    const eventos = eventosData.map(e => ({
      id: Number(e.id),
      nombre: e.nombre,
      descripcion: e.descripcion,
      fecha_inicio: e.fecha_inicio,
      fecha_fin: e.fecha_fin
    }));

    res.json({
      success: true,
      data: {
        registrado,
        equipo,
        proyecto,
        miembros,
        puntajeTotal,
        chartLabels,
        chartData,
        invitaciones,
        eventos,
        evento_inscrito
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as participanteDashboardRouter };
