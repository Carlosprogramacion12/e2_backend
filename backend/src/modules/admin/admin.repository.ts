import prisma from '../../utils/prisma';
import { SaveDashboardPreferencesDto } from './admin.types';

export class AdminRepository {
  async getDashboardMetrics() {
    // 1. Total Jueces
    const total_jueces = await prisma.users.count({
      where: {
        user_rol: {
          some: {
            roles: { nombre: 'Juez' }
          }
        }
      }
    });

    // 2. Total Participantes
    const total_participantes = await prisma.users.count({
      where: {
        user_rol: {
          some: {
            roles: { nombre: 'Participante' }
          }
        }
      }
    });

    // 3. Totales Simples
    const total_equipos = await prisma.equipos.count();
    const total_proyectos = await prisma.proyectos.count();

    // 4. Eventos activos
    const eventos_activos = await prisma.eventos.findMany({
      where: {
        fecha_fin: { gte: new Date() }
      },
      orderBy: { fecha_inicio: 'asc' }
    });

    // 5. Participantes por Carrera
    const participantesPorCarreraData = await prisma.$queryRaw<Array<{ nombre: string, total: bigint }>>`
      SELECT c.nombre, COUNT(*) as total
      FROM participantes p
      JOIN carreras c ON p.carrera_id = c.id
      WHERE p.deleted_at IS NULL AND c.deleted_at IS NULL
      GROUP BY c.nombre
    `;
    const participantesPorCarrera: Record<string, number> = {};
    participantesPorCarreraData.forEach(row => {
      participantesPorCarrera[row.nombre] = Number(row.total);
    });

    // 6. Proyectos Evaluados
    const proyectosEvaluadosData = await prisma.proyectos.findMany({
      where: {
        calificaciones: { some: {} }
      },
      select: { id: true }
    });
    const proyectosEvaluados = proyectosEvaluadosData.length;
    const proyectosPendientes = total_proyectos - proyectosEvaluados;

    // 7. Estadísticas por Evento
    const todos_eventos = await prisma.eventos.findMany({
      include: {
        proyectos: {
          include: { calificaciones: true }
        }
      }
    });

    const eventos_stats = todos_eventos.map(evento => {
      const totalProyectos = evento.proyectos.length;
      const evaluados = evento.proyectos.filter(p => p.calificaciones.length > 0).length;
      return {
        id: Number(evento.id),
        nombre: evento.nombre,
        total: totalProyectos,
        evaluados,
        pendientes: totalProyectos - evaluados
      };
    });

    return {
      total_jueces,
      total_participantes,
      total_equipos,
      total_proyectos,
      eventos_activos,
      participantesPorCarrera,
      proyectosEvaluados,
      proyectosPendientes,
      eventos_stats
    };
  }

  async getUserPreferences(userId: number) {
    return prisma.dashboard_preferences.findMany({
      where: { user_id: BigInt(userId) }
    });
  }

  async saveUserPreferences(userId: number, preferences: SaveDashboardPreferencesDto) {
    const operations = preferences.widgets.map(async (w) => {
      const existing = await prisma.dashboard_preferences.findFirst({
        where: { user_id: BigInt(userId), widget_key: w.key }
      });

      if (existing) {
        return prisma.dashboard_preferences.update({
          where: { id: existing.id },
          data: {
            position: w.position,
            is_visible: w.is_visible,
            settings: w.settings ? JSON.stringify(w.settings) : undefined,
            updated_at: new Date()
          }
        });
      } else {
        return prisma.dashboard_preferences.create({
          data: {
            user_id: BigInt(userId),
            widget_key: w.key,
            position: w.position,
            is_visible: w.is_visible,
            settings: w.settings ? JSON.stringify(w.settings) : undefined,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }
    });

    await Promise.all(operations);
    return true;
  }
}
