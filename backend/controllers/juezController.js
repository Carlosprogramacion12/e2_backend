/**
 * Controlador del Módulo Juez
 * Equivalente a Juez\JuezController + Juez\EvaluacionController
 */
const { Evento, Proyecto, Calificacion, CriterioEvaluacion, Equipo, EvaluacionComentario, User } = require('../models');
const sequelize = require('../config/database');

exports.dashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventosAsignados = await Evento.findAll({
      include: [{ model: User, as: 'jueces', where: { id: userId }, through: { attributes: [] } }]
    });

    const eventosConProyectos = await Promise.all(eventosAsignados.map(async (evento) => {
      const proyectos = await Proyecto.findAll({
        where: { evento_id: evento.id },
        include: [
          { model: Equipo, as: 'equipo' },
          { model: Calificacion, as: 'calificaciones', where: { juez_user_id: userId }, required: false }
        ]
      });
      return {
        evento: { id: evento.id, nombre: evento.nombre, fecha_inicio: evento.fecha_inicio, fecha_fin: evento.fecha_fin },
        proyectos: proyectos.map(p => ({
          id: p.id, nombre: p.nombre, equipo: p.equipo?.nombre || 'Sin equipo',
          evaluado: p.calificaciones.length > 0
        })),
        totalProyectos: proyectos.length,
        evaluados: proyectos.filter(p => p.calificaciones.length > 0).length
      };
    }));

    res.json({ success: true, data: { eventos: eventosConProyectos } });
  } catch (error) {
    console.error('Error dashboard juez:', error);
    res.status(500).json({ success: false, message: 'Error al cargar dashboard del juez' });
  }
};

exports.showEvento = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.eventoId, {
      include: [
        { model: CriterioEvaluacion, as: 'criterios' },
        { model: Proyecto, as: 'proyectos', include: [
          { model: Equipo, as: 'equipo' },
          { model: Calificacion, as: 'calificaciones', where: { juez_user_id: req.user.id }, required: false }
        ]}
      ]
    });
    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    res.json({ success: true, data: evento });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener evento' });
  }
};

exports.editEvaluacion = async (req, res) => {
  try {
    const userId = req.user.id;
    const proyecto = await Proyecto.findByPk(req.params.proyectoId, {
      include: [
        { model: Evento, as: 'evento', include: [{ model: CriterioEvaluacion, as: 'criterios' }] },
        { model: Equipo, as: 'equipo' },
        { model: Calificacion, as: 'calificaciones', where: { juez_user_id: userId }, required: false }
      ]
    });
    if (!proyecto) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });

    const asignado = await Evento.findOne({
      where: { id: proyecto.evento_id },
      include: [{ model: User, as: 'jueces', where: { id: userId }, through: { attributes: [] } }]
    });
    if (!asignado) return res.status(403).json({ success: false, message: 'No tienes permiso para evaluar este proyecto.' });

    const calificacionesPrevias = {};
    proyecto.calificaciones.forEach(c => { calificacionesPrevias[c.criterio_id] = parseFloat(c.puntuacion); });

    const comentario = await EvaluacionComentario.findOne({ where: { proyecto_id: proyecto.id, juez_user_id: userId } });

    res.json({ success: true, data: { proyecto, calificacionesPrevias, comentarioPrevio: comentario?.comentario || '' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener evaluación' });
  }
};

exports.storeEvaluacion = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { puntuaciones, comentario } = req.body;
    const juezId = req.user.id;
    const proyectoId = req.params.proyectoId;

    if (!puntuaciones) { await t.rollback(); return res.status(400).json({ success: false, message: 'Puntuaciones requeridas' }); }

    for (const [criterioId, puntuacion] of Object.entries(puntuaciones)) {
      await Calificacion.upsert({ proyecto_id: proyectoId, juez_user_id: juezId, criterio_id: parseInt(criterioId), puntuacion: parseFloat(puntuacion) }, { transaction: t });
    }

    if (comentario !== undefined) {
      await EvaluacionComentario.upsert({ proyecto_id: proyectoId, juez_user_id: juezId, comentario }, { transaction: t });
    }

    await t.commit();
    res.json({ success: true, message: 'Evaluación guardada.' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Error al guardar evaluación' });
  }
};
