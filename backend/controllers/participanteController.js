/**
 * Controlador del Módulo Participante
 * Equivalente a Participante\ParticipanteController + PerfilController + EquipoController
 */
const { User, Participante, Equipo, Proyecto, Evento, Calificacion, CriterioEvaluacion, Carrera, Perfil, SolicitudEquipo, InvitacionEquipo } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { calcularRanking, getTextoLogro, calcularPuntajeProyecto } = require('../services/rankingService');
const { generarConstanciaPDF } = require('../services/pdfService');

// GET /api/participante/dashboard
exports.dashboard = async (req, res) => {
  try {
    const user = req.user;
    const participante = await Participante.findOne({ where: { user_id: user.id } });
    if (!participante) return res.json({ success: true, data: { needsProfile: true } });

    const equipo = await Equipo.findOne({
      include: [{
        model: Participante, as: 'participantes', where: { id: participante.id },
        through: { attributes: ['perfil_id'] }
      }]
    });

    let proyecto = null, evento_inscrito = null, chartLabels = [], chartData = [], puntajeTotal = 0;
    let es_lider = false, evento_finalizado = false, solicitudes_pendientes = [], invitaciones_pendientes = [];
    let eventos_disponibles_count = 0;

    if (equipo) {
      proyecto = await Proyecto.findOne({
        where: { equipo_id: equipo.id },
        include: [
          { model: Evento, as: 'evento', include: [{ model: CriterioEvaluacion, as: 'criterios' }] },
          { model: Calificacion, as: 'calificaciones' }
        ]
      });

      // Check leader
      const [liderRow] = await sequelize.query(
        'SELECT participante_id FROM equipo_participante WHERE equipo_id = ? AND perfil_id = 3 LIMIT 1',
        { replacements: [equipo.id], type: sequelize.QueryTypes.SELECT }
      );
      es_lider = liderRow && liderRow.participante_id == participante.id;

      if (es_lider) {
        solicitudes_pendientes = await SolicitudEquipo.findAll({
          where: { equipo_id: equipo.id, estado: 'pendiente' },
          include: [
            { model: Participante, as: 'participante', include: [{ model: User, as: 'user', attributes: ['name'] }, { model: Carrera, as: 'carrera' }] },
            { model: Perfil, as: 'perfilSugerido' }
          ]
        });
      }

      if (proyecto && proyecto.evento) {
        evento_inscrito = proyecto.evento;
        evento_finalizado = new Date() > new Date(proyecto.evento.fecha_fin);
        const result = await calcularPuntajeProyecto(proyecto, proyecto.evento.criterios);
        chartLabels = result.chartLabels;
        chartData = result.chartData;
        puntajeTotal = result.puntajeTotal;
      }
    }

    invitaciones_pendientes = await InvitacionEquipo.findAll({
      where: { participante_id: participante.id, estado: 'pendiente' },
      include: [
        { model: Equipo, as: 'equipo', include: [{ model: Proyecto, as: 'proyecto' }] },
        { model: Participante, as: 'enviadaPor', include: [{ model: User, as: 'user', attributes: ['name'] }] },
        { model: Perfil, as: 'perfilSugerido' }
      ]
    });

    if (!equipo) {
      eventos_disponibles_count = await Evento.count({ where: { fecha_fin: { [Op.gte]: new Date() } } });
    }

    const eventos_proximos = await Evento.findAll({
      where: { fecha_fin: { [Op.gte]: new Date() } }, order: [['fecha_inicio', 'ASC']], limit: 3
    });

    res.json({
      success: true,
      data: {
        equipo, proyecto, evento_inscrito, eventos_disponibles_count,
        chartLabels, chartData, puntajeTotal, eventos_proximos,
        solicitudes_pendientes, invitaciones_pendientes, es_lider, evento_finalizado
      }
    });
  } catch (error) {
    console.error('Error dashboard participante:', error);
    res.status(500).json({ success: false, message: 'Error al cargar dashboard' });
  }
};

// POST /api/participante/registro-inicial
exports.registroInicial = async (req, res) => {
  try {
    const { carrera_id, no_control, telefono } = req.body;
    if (!carrera_id || !no_control) return res.status(400).json({ success: false, message: 'Carrera y No. Control requeridos' });

    let participante = await Participante.findOne({ where: { user_id: req.user.id } });
    if (participante) {
      await participante.update({ carrera_id, no_control, telefono });
    } else {
      participante = await Participante.create({ user_id: req.user.id, carrera_id, no_control, telefono });
    }

    res.json({ success: true, message: 'Perfil registrado exitosamente.', data: participante });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar perfil' });
  }
};

// GET /api/participante/registro-inicial
exports.getRegistroInicial = async (req, res) => {
  try {
    const carreras = await Carrera.findAll({ order: [['nombre', 'ASC']] });
    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    res.json({ success: true, data: { carreras, participante } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// POST /api/participante/constancia/:tipo
exports.generarConstancia = async (req, res) => {
  try {
    const { tipo } = req.params;
    const user = req.user;
    const participante = await Participante.findOne({ where: { user_id: user.id } });
    const equipo = participante ? await Equipo.findOne({
      include: [{ model: Participante, as: 'participantes', where: { id: participante.id }, through: { attributes: ['perfil_id'] },
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] }]
    }) : null;
    const proyecto = equipo ? await Proyecto.findOne({
      where: { equipo_id: equipo.id },
      include: [{ model: Evento, as: 'evento', include: [{ model: CriterioEvaluacion, as: 'criterios' }] }]
    }) : null;

    if (!proyecto || !proyecto.evento) return res.status(404).json({ success: false, message: 'No hay proyecto disponible.' });

    if (new Date() < new Date(proyecto.evento.fecha_fin)) {
      return res.status(400).json({ success: false, message: 'Las constancias estarán disponibles al finalizar el evento.' });
    }

    const ranking = await calcularRanking(proyecto.evento.id);
    const idx = ranking.findIndex(r => r.id === proyecto.id);
    const miLugar = idx !== -1 ? idx + 1 : 999;
    const textoLogro = getTextoLogro(miLugar);

    const nombreTitular = tipo === 'individual' ? user.name : equipo.nombre;
    const mostrarIntegrantes = tipo !== 'individual';

    // Reload equipo with all participants
    const equipoCompleto = await Equipo.findByPk(equipo.id, {
      include: [{ model: Participante, as: 'participantes', include: [{ model: User, as: 'user', attributes: ['id', 'name'] }], through: { attributes: ['perfil_id'] } }]
    });

    generarConstanciaPDF(res, { proyecto: { ...proyecto.toJSON(), equipo: equipoCompleto }, textoLogro, nombreTitular, mostrarIntegrantes, evento: proyecto.evento });
  } catch (error) {
    console.error('Error generando constancia:', error);
    res.status(500).json({ success: false, message: 'Error al generar constancia' });
  }
};
