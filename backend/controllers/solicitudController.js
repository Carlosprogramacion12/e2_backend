/**
 * Controlador de Solicitudes de Equipo
 * Equivalente a Participante\SolicitudEquipoController
 */
const { SolicitudEquipo, Equipo, Participante, User, Perfil, Carrera } = require('../models');
const sequelize = require('../config/database');

// GET /api/participante/solicitudes/mis
exports.misSolicitudes = async (req, res) => {
  try {
    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    const solicitudes = await SolicitudEquipo.findAll({
      where: { participante_id: participante.id },
      include: [
        { model: Equipo, as: 'equipo' },
        { model: Perfil, as: 'perfilSugerido' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: solicitudes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// GET /api/participante/solicitudes/equipo/:equipoId
exports.verSolicitudesEquipo = async (req, res) => {
  try {
    const solicitudes = await SolicitudEquipo.findAll({
      where: { equipo_id: req.params.equipoId },
      include: [
        { model: Participante, as: 'participante', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }, { model: Carrera, as: 'carrera' }] },
        { model: Perfil, as: 'perfilSugerido' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: solicitudes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// POST /api/participante/solicitudes/:equipoId
exports.crearSolicitud = async (req, res) => {
  try {
    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    const { mensaje, perfil_solicitado_id } = req.body;

    const existente = await SolicitudEquipo.findOne({
      where: { equipo_id: req.params.equipoId, participante_id: participante.id, estado: 'pendiente' }
    });
    if (existente) return res.status(400).json({ success: false, message: 'Ya tienes solicitud pendiente.' });

    const solicitud = await SolicitudEquipo.create({
      equipo_id: req.params.equipoId,
      participante_id: participante.id,
      perfil_solicitado_id,
      mensaje,
      estado: 'pendiente'
    });
    res.status(201).json({ success: true, message: 'Solicitud enviada.', data: solicitud });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear solicitud' });
  }
};

// POST /api/participante/solicitudes/:id/aceptar
exports.aceptar = async (req, res) => {
  try {
    const solicitud = await SolicitudEquipo.findByPk(req.params.id);
    if (!solicitud || solicitud.estado !== 'pendiente') return res.status(400).json({ success: false, message: 'Solicitud no válida.' });

    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    await solicitud.update({ estado: 'aceptada', respondida_por_participante_id: participante.id, respondida_en: new Date() });

    // Agregar al equipo
    await sequelize.query(
      'INSERT INTO equipo_participante (equipo_id, participante_id, perfil_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      { replacements: [solicitud.equipo_id, solicitud.participante_id, solicitud.perfil_solicitado_id || 1] }
    );

    res.json({ success: true, message: 'Solicitud aceptada.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// POST /api/participante/solicitudes/:id/rechazar
exports.rechazar = async (req, res) => {
  try {
    const solicitud = await SolicitudEquipo.findByPk(req.params.id);
    if (!solicitud) return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });

    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    await solicitud.update({ estado: 'rechazada', respondida_por_participante_id: participante.id, respondida_en: new Date() });
    res.json({ success: true, message: 'Solicitud rechazada.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};
