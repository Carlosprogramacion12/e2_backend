/**
 * Servicio de cálculo de ranking y puntajes ponderados
 * Replica la lógica exacta del ResultadosController y ParticipanteController de Laravel
 * 
 * Fórmula: (Promedio_Jueces × Ponderación_Criterio) / 100
 */
const { Proyecto, Calificacion, CriterioEvaluacion, Equipo, Participante, User } = require('../models');

/**
 * Calcula el ranking para un evento dado
 * @param {number} eventoId
 * @returns {Array} ranking ordenado desc por puntaje
 */
async function calcularRanking(eventoId) {
  const proyectos = await Proyecto.findAll({
    where: { evento_id: eventoId },
    include: [
      { model: Calificacion, as: 'calificaciones' },
      {
        model: Equipo, as: 'equipo',
        include: [{
          model: Participante, as: 'participantes',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
          through: { attributes: ['perfil_id'] }
        }]
      }
    ]
  });

  const criterios = await CriterioEvaluacion.findAll({
    where: { evento_id: eventoId }
  });

  const ranking = proyectos.map(proyecto => {
    let totalPuntos = 0;

    // Agrupar calificaciones por criterio_id
    const calificacionesPorCriterio = {};
    proyecto.calificaciones.forEach(cal => {
      if (!calificacionesPorCriterio[cal.criterio_id]) {
        calificacionesPorCriterio[cal.criterio_id] = [];
      }
      calificacionesPorCriterio[cal.criterio_id].push(parseFloat(cal.puntuacion));
    });

    criterios.forEach(criterio => {
      const notas = calificacionesPorCriterio[criterio.id];
      if (notas && notas.length > 0) {
        const promedio = notas.reduce((a, b) => a + b, 0) / notas.length;
        const puntosReales = (promedio * parseFloat(criterio.ponderacion)) / 100;
        totalPuntos += puntosReales;
      }
    });

    return {
      id: proyecto.id,
      nombre: proyecto.nombre,
      equipo: proyecto.equipo ? proyecto.equipo.nombre : 'Sin equipo',
      puntaje: Math.round(totalPuntos * 100) / 100,
      integrantes: proyecto.equipo ? proyecto.equipo.participantes : []
    };
  });

  // Ordenar de mayor a menor
  ranking.sort((a, b) => b.puntaje - a.puntaje);
  return ranking;
}

/**
 * Determina el texto de logro según la posición
 */
function getTextoLogro(posicion) {
  switch (posicion) {
    case 1: return 'PRIMER LUGAR';
    case 2: return 'SEGUNDO LUGAR';
    case 3: return 'TERCER LUGAR';
    default: return 'PARTICIPACIÓN';
  }
}

/**
 * Calcula el puntaje y datos de radar chart para un proyecto específico
 */
async function calcularPuntajeProyecto(proyecto, criterios) {
  const chartLabels = [];
  const chartData = [];
  let puntajeTotal = 0;

  const calificacionesPorCriterio = {};
  proyecto.calificaciones.forEach(cal => {
    if (!calificacionesPorCriterio[cal.criterio_id]) {
      calificacionesPorCriterio[cal.criterio_id] = [];
    }
    calificacionesPorCriterio[cal.criterio_id].push(parseFloat(cal.puntuacion));
  });

  criterios.forEach(criterio => {
    chartLabels.push(criterio.nombre);
    const notas = calificacionesPorCriterio[criterio.id];
    const promedio = (notas && notas.length > 0)
      ? notas.reduce((a, b) => a + b, 0) / notas.length
      : 0;

    chartData.push(Math.round(promedio * 10) / 10);
    puntajeTotal += (promedio * parseFloat(criterio.ponderacion)) / 100;
  });

  return { chartLabels, chartData, puntajeTotal: Math.round(puntajeTotal * 100) / 100 };
}

module.exports = { calcularRanking, getTextoLogro, calcularPuntajeProyecto };
