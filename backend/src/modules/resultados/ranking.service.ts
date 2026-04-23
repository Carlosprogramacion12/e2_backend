import prisma from '../../prisma.config';

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
      const scoresPerJudge: Record<string, Record<string, number>> = {};
      const judgesThatRated = new Set<string>();

      proyecto.evaluaciones.forEach((cal: any) => {
        const juezId = cal.juez_id.toString();
        const critId = cal.criterio_id.toString();
        judgesThatRated.add(juezId);

        if (!scoresPerJudge[juezId]) scoresPerJudge[juezId] = {};
        scoresPerJudge[juezId][critId] = Number(cal.puntuacion);
      });

      let totalPuntos = 0;
      if (judgesThatRated.size > 0) {
        let sumWeightedTotals = 0;
        for (const jId of judgesThatRated) {
          let judgeWeightedTotal = 0;
          criterios.forEach((criterio: any) => {
            const score = scoresPerJudge[jId][criterio.id.toString()] || 0;
            judgeWeightedTotal += (score * Number(criterio.ponderacion)) / 100;
          });
          sumWeightedTotals += judgeWeightedTotal;
        }
        totalPuntos = sumWeightedTotals / judgesThatRated.size;
      }

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
    const scoresPerJudge: Record<string, Record<string, number>> = {};
    const judgesThatRated = new Set<string>();

    (proyecto as any).evaluaciones.forEach((cal: any) => {
      const juezId = cal.juez_id.toString();
      const critId = cal.criterio_id.toString();
      judgesThatRated.add(juezId);
      if (!scoresPerJudge[juezId]) scoresPerJudge[juezId] = {};
      scoresPerJudge[juezId][critId] = Number(cal.puntuacion);
    });

    criterios.forEach((criterio: any) => {
      chartLabels.push(criterio.nombre);
      let sumCrit = 0;
      let countCrit = 0;
      for (const jId of judgesThatRated) {
        const s = scoresPerJudge[jId][criterio.id.toString()];
        if (s !== undefined) {
          sumCrit += s;
          countCrit++;
        }
      }
      const avgCrit = countCrit > 0 ? sumCrit / countCrit : 0;
      chartData.push(Math.round(avgCrit * 10) / 10);
    });

    let totalPuntos = 0;
    if (judgesThatRated.size > 0) {
      let sumWeightedTotals = 0;
      for (const jId of judgesThatRated) {
        let judgeWeightedTotal = 0;
        criterios.forEach((criterio: any) => {
          const score = scoresPerJudge[jId][criterio.id.toString()] || 0;
          judgeWeightedTotal += (score * Number(criterio.ponderacion)) / 100;
        });
        sumWeightedTotals += judgeWeightedTotal;
      }
      totalPuntos = sumWeightedTotals / judgesThatRated.size;
    }

    return { 
      chartLabels, 
      chartData, 
      puntajeTotal: Math.round(totalPuntos * 100) / 100 
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
