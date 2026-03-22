/**
 * Controlador de Invitaciones de Equipo
 * Equivalente a Participante\InvitacionEquipoController
 */
const { InvitacionEquipo, Equipo, Participante, User, Perfil } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// GET /api/participante/invitaciones/mis
exports.misInvitaciones = async (req, res) => {
  try {
    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    const invitaciones = await InvitacionEquipo.findAll({
      where: { participante_id: participante.id },
      include: [
        { model: Equipo, as: 'equipo', include: [{ model: require('../models/Proyecto'), as: 'proyecto' }] },
        { model: Participante, as: 'enviadaPor', include: [{ model: User, as: 'user', attributes: ['name'] }] },
        { model: Perfil, as: 'perfilSugerido' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: invitaciones });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// POST /api/participante/invitaciones/:id/aceptar
exports.aceptar = async (req, res) => {
  try {
    const invitacion = await InvitacionEquipo.findByPk(req.params.id);
    if (!invitacion || invitacion.estado !== 'pendiente') return res.status(400).json({ success: false, message: 'Invitación no válida.' });

    await invitacion.update({ estado: 'aceptada', respondida_en: new Date() });

    await sequelize.query(
      'INSERT INTO equipo_participante (equipo_id, participante_id, perfil_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      { replacements: [invitacion.equipo_id, invitacion.participante_id, invitacion.perfil_sugerido_id || 1] }
    );

    res.json({ success: true, message: 'Invitación aceptada.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// POST /api/participante/invitaciones/:id/rechazar
exports.rechazar = async (req, res) => {
  try {
    const invitacion = await InvitacionEquipo.findByPk(req.params.id);
    if (!invitacion) return res.status(404).json({ success: false, message: 'Invitación no encontrada.' });
    await invitacion.update({ estado: 'rechazada', respondida_en: new Date() });
    res.json({ success: true, message: 'Invitación rechazada.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// POST /api/participante/equipos/:equipoId/invitar
exports.enviarInvitacion = async (req, res) => {
  try {
    const { participante_id, perfil_sugerido_id, mensaje } = req.body;
    const participanteActual = await Participante.findOne({ where: { user_id: req.user.id } });

    const invitacion = await InvitacionEquipo.create({
      equipo_id: req.params.equipoId,
      participante_id,
      perfil_sugerido_id,
      mensaje,
      estado: 'pendiente',
      enviada_por_participante_id: participanteActual.id
    });
    res.status(201).json({ success: true, message: 'Invitación enviada.', data: invitacion });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al enviar invitación' });
  }
};

// GET /api/participante/equipos/:equipoId/invitaciones-enviadas
exports.invitacionesEnviadas = async (req, res) => {
  try {
    const invitaciones = await InvitacionEquipo.findAll({
      where: { equipo_id: req.params.equipoId },
      include: [
        { model: Participante, as: 'participante', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
        { model: Perfil, as: 'perfilSugerido' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: invitaciones });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};
