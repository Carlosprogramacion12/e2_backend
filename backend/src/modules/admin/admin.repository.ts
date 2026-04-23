import prisma from '../../prisma.config';
import { SaveDashboardPreferencesDto } from './admin.types';

export class AdminRepository {
  async getDashboardMetrics() {
    // 1. Total Jueces (using role enum)
    const total_jueces = await prisma.users.count({
      where: { role: 'JUEZ' }
    });

    // 2. Total Participantes
    const total_participantes = await prisma.users.count({
      where: { role: 'PARTICIPANTE' }
    });

    // 3. Totales Simples
    const total_equipos = await prisma.equipos.count();
    const total_proyectos = await prisma.proyectos.count();

    const now = new Date();
    const eventos_proximos_count = await prisma.eventos.count({
      where: { fecha_inicio: { gt: now } }
    });
    const eventos_activos_count = await prisma.eventos.count({
      where: { fecha_inicio: { lte: now }, fecha_fin: { gte: now } }
    });
    const eventos_finalizados_count = await prisma.eventos.count({
      where: { fecha_fin: { lt: now } }
    });
    // Keep backwards compat
    const eventos_activos = await prisma.eventos.findMany({
      where: { fecha_fin: { gte: now } },
      orderBy: { fecha_inicio: 'asc' }
    });

    // 5. Participantes por Carrera (from users.carrera field)
    const participantesPorCarreraData = await prisma.$queryRaw<Array<{ nombre: string, total: bigint }>>`
      SELECT carrera as nombre, COUNT(*) as total
      FROM users
      WHERE role = 'PARTICIPANTE' AND carrera IS NOT NULL AND carrera != ''
      GROUP BY carrera
    `;
    const participantesPorCarrera: Record<string, number> = {};
    participantesPorCarreraData.forEach(row => {
      participantesPorCarrera[row.nombre || 'Sin carrera'] = Number(row.total);
    });

    // 6. Proyectos Evaluados (evaluaciones table)
    const proyectosEvaluadosData = await prisma.proyectos.findMany({
      where: {
        evaluaciones: { some: {} }
      },
      select: { id: true }
    });
    const proyectosEvaluados = proyectosEvaluadosData.length;
    const proyectosPendientes = total_proyectos - proyectosEvaluados;

    // 7. Estadísticas por Evento
    const todos_eventos = await prisma.eventos.findMany({
      include: {
        proyectos: {
          include: { evaluaciones: true }
        }
      }
    });

    const eventos_stats = todos_eventos.map(evento => {
      const totalProyectos = evento.proyectos.length;
      const evaluados = evento.proyectos.filter(p => p.evaluaciones.length > 0).length;
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
      eventos_proximos_count,
      eventos_activos_count,
      eventos_finalizados_count,
      participantesPorCarrera,
      proyectosEvaluados,
      proyectosPendientes,
      eventos_stats
    };
  }

  async getUserPreferences(userId: number) {
    // user_preferences - single row per user in new schema
    const pref = await prisma.user_preferences.findUnique({
      where: { user_id: BigInt(userId) }
    });
    if (pref && pref.settings) {
      try {
        const parsed = JSON.parse(pref.settings);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  async saveUserPreferences(userId: number, preferences: SaveDashboardPreferencesDto) {
    const settingsJson = JSON.stringify(preferences.widgets);
    
    // Upsert into user_preferences
    await prisma.user_preferences.upsert({
      where: { user_id: BigInt(userId) },
      update: {
        settings: settingsJson,
        updated_at: new Date()
      },
      create: {
        user_id: BigInt(userId),
        settings: settingsJson,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    return true;
  }
}
