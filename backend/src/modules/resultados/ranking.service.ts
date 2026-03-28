import prisma from '../../utils/prisma';

export class RankingService {
  async calcularRanking(eventoId: number) {
    const proyectos = await prisma.proyectos.findMany({
      where: { evento_id: BigInt(eventoId) },
      include: {
        evaluaciones: true,
        equipos: {
          include: {
            equipo_miembros: {
              include: { users: true }
            }
          }
        }
      }
    });

    const criterios = await prisma.evaluacion_criterios.findMany({
      where: { evento_id: BigInt(eventoId) }
    });

    const ranking = proyectos.map((proyecto: any) => {
      let totalPuntos = 0;

      const calificacionesPorCriterio: Record<string, number[]> = {};
      proyecto.evaluaciones.forEach((cal: any) => {
        const critId = cal.criterio_id.toString();
        if (!calificacionesPorCriterio[critId]) {
          calificacionesPorCriterio[critId] = [];
        }
        calificacionesPorCriterio[critId].push(Number(cal.puntuacion));
      });

      criterios.forEach((criterio: any) => {
        const notas = calificacionesPorCriterio[criterio.id.toString()];
        if (notas && notas.length > 0) {
          const promedio = notas.reduce((a: number, b: number) => a + b, 0) / notas.length;
          const puntosReales = (promedio * Number(criterio.ponderacion)) / 100;
          totalPuntos += puntosReales;
        }
      });

      const integrantes = proyecto.equipos?.equipo_miembros?.map((m: any) => ({
        id: Number(m.users.id),
        user_id: Number(m.users.id),
        name: m.users.name,
        email: m.users.email,
        rol: m.rol
      })) || [];

      return {
        id: Number(proyecto.id),
        nombre: proyecto.nombre,
        equipo: proyecto.equipos ? proyecto.equipos.nombre : 'Sin equipo',
        puntaje: Math.round(totalPuntos * 100) / 100,
        integrantes
      };
    });

    ranking.sort((a: any, b: any) => b.puntaje - a.puntaje);
    return ranking;
  }

  async calcularPuntajeProyecto(proyectoId: number) {
    const proyecto = await prisma.proyectos.findUnique({
      where: { id: BigInt(proyectoId) },
      include: { evaluaciones: true, eventos: true }
    });

    if (!proyecto) throw new Error('Proyecto no encontrado');

    const criterios = await prisma.evaluacion_criterios.findMany({
      where: { evento_id: (proyecto as any).evento_id }
    });

    const chartLabels: string[] = [];
    const chartData: number[] = [];
    let puntajeTotal = 0;

    const calificacionesPorCriterio: Record<string, number[]> = {};
    (proyecto as any).evaluaciones.forEach((cal: any) => {
      const critId = cal.criterio_id.toString();
      if (!calificacionesPorCriterio[critId]) {
        calificacionesPorCriterio[critId] = [];
      }
      calificacionesPorCriterio[critId].push(Number(cal.puntuacion));
    });

    criterios.forEach((criterio: any) => {
      chartLabels.push(criterio.nombre);
      const notas = calificacionesPorCriterio[criterio.id.toString()];
      const promedio = (notas && notas.length > 0)
        ? notas.reduce((a: number, b: number) => a + b, 0) / notas.length
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
