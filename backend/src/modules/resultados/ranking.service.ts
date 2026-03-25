import prisma from '../../utils/prisma';

export class RankingService {
  /**
   * Calcula el ranking para un evento dado
   * @param eventoId ID del evento
   * @returns ranking ordenado descendentemente por puntaje
   */
  async calcularRanking(eventoId: number) {
    const proyectos = await prisma.proyectos.findMany({
      where: { evento_id: BigInt(eventoId) },
      include: {
        calificaciones: true,
        equipos: {
          include: {
            equipo_participante: {
              include: {
                participantes: {
                  include: { users: true }
                }
              }
            }
          }
        }
      }
    });

    const criterios = await prisma.criterio_evaluacion.findMany({
      where: { evento_id: BigInt(eventoId) }
    });

    const ranking = proyectos.map((proyecto) => {
      let totalPuntos = 0;

      // Agrupar calificaciones por criterio_id
      const calificacionesPorCriterio: Record<string, number[]> = {};
      proyecto.calificaciones.forEach((cal) => {
        const critId = cal.criterio_id.toString();
        if (!calificacionesPorCriterio[critId]) {
          calificacionesPorCriterio[critId] = [];
        }
        calificacionesPorCriterio[critId].push(Number(cal.puntuacion));
      });

      criterios.forEach((criterio) => {
        const notas = calificacionesPorCriterio[criterio.id.toString()];
        if (notas && notas.length > 0) {
          const promedio = notas.reduce((a, b) => a + b, 0) / notas.length;
          const puntosReales = (promedio * Number(criterio.ponderacion)) / 100;
          totalPuntos += puntosReales;
        }
      });

      const integrantes = proyecto.equipos?.equipo_participante.map((ep) => ({
        id: Number(ep.participantes.id),
        user_id: Number(ep.participantes.user_id),
        name: ep.participantes.users.name,
        email: ep.participantes.users.email,
        perfil_id: Number(ep.perfil_id)
      })) || [];

      return {
        id: Number(proyecto.id),
        nombre: proyecto.nombre,
        equipo: proyecto.equipos ? proyecto.equipos.nombre : 'Sin equipo',
        puntaje: Math.round(totalPuntos * 100) / 100,
        integrantes
      };
    });

    // Ordenar de mayor a menor
    ranking.sort((a, b) => b.puntaje - a.puntaje);
    return ranking;
  }

  /**
   * Calcula el puntaje y datos de radar chart para un proyecto específico
   */
  async calcularPuntajeProyecto(proyectoId: number) {
    const proyecto = await prisma.proyectos.findUnique({
      where: { id: BigInt(proyectoId) },
      include: { calificaciones: true, eventos: true }
    });

    if (!proyecto) throw new Error('Proyecto no encontrado');

    const criterios = await prisma.criterio_evaluacion.findMany({
      where: { evento_id: proyecto.evento_id }
    });

    const chartLabels: string[] = [];
    const chartData: number[] = [];
    let puntajeTotal = 0;

    const calificacionesPorCriterio: Record<string, number[]> = {};
    proyecto.calificaciones.forEach((cal) => {
      const critId = cal.criterio_id.toString();
      if (!calificacionesPorCriterio[critId]) {
        calificacionesPorCriterio[critId] = [];
      }
      calificacionesPorCriterio[critId].push(Number(cal.puntuacion));
    });

    criterios.forEach((criterio) => {
      chartLabels.push(criterio.nombre);
      const notas = calificacionesPorCriterio[criterio.id.toString()];
      const promedio = (notas && notas.length > 0)
        ? notas.reduce((a, b) => a + b, 0) / notas.length
        : 0;

      chartData.push(Math.round(promedio * 10) / 10);
      puntajeTotal += (promedio * Number(criterio.ponderacion)) / 100;
    });

    return { 
      chartLabels, 
      chartData, 
      puntajeTotal: Math.round(puntajeTotal * 100) / 100 
    };
  }

  getTextoLogro(posicion: number) {
    switch (posicion) {
      case 1: return 'PRIMER LUGAR';
      case 2: return 'SEGUNDO LUGAR';
      case 3: return 'TERCER LUGAR';
      default: return 'PARTICIPACIÓN';
    }
  }
}
