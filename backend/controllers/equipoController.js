/**
 * Controlador CRUD de Equipos (Admin)
 * Equivalente a Admin\EquipoController
 */
const { Equipo, Proyecto, Participante, User, Evento, Perfil } = require('../models');
const sequelize = require('../config/database');

// GET /api/admin/equipos
exports.index = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Equipo.findAndCountAll({
      include: [
        { model: Proyecto, as: 'proyecto', include: [{ model: Evento, as: 'evento' }] },
        { model: Participante, as: 'participantes', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }], through: { attributes: ['perfil_id'] } }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      success: true,
      data: {
        equipos: rows,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) }
      }
    });
  } catch (error) {
    console.error('Error listando equipos:', error);
    res.status(500).json({ success: false, message: 'Error al listar equipos' });
  }
};

// GET /api/admin/equipos/:id
exports.show = async (req, res) => {
  try {
    const equipo = await Equipo.findByPk(req.params.id, {
      include: [
        { model: Proyecto, as: 'proyecto', include: [{ model: Evento, as: 'evento' }] },
        { model: Participante, as: 'participantes', include: [{ model: User, as: 'user', attributes: ['id', 'name'] }, { model: require('../models/Carrera'), as: 'carrera' }], through: { attributes: ['perfil_id'] } }
      ]
    });

    if (!equipo) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    res.json({ success: true, data: equipo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener equipo' });
  }
};

// PUT /api/admin/equipos/:id
exports.update = async (req, res) => {
  try {
    const equipo = await Equipo.findByPk(req.params.id);
    if (!equipo) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    await equipo.update(req.body);
    res.json({ success: true, message: 'Equipo actualizado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar equipo' });
  }
};

// DELETE /api/admin/equipos/:id
exports.destroy = async (req, res) => {
  try {
    const equipo = await Equipo.findByPk(req.params.id);
    if (!equipo) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    await equipo.destroy();
    res.json({ success: true, message: 'Equipo eliminado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar equipo' });
  }
};

// POST /api/admin/equipos/:id/miembros
exports.addMember = async (req, res) => {
  try {
    const { participante_id, perfil_id } = req.body;
    const equipo = await Equipo.findByPk(req.params.id);
    if (!equipo) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    await equipo.addParticipante(participante_id, { through: { perfil_id } });
    res.json({ success: true, message: 'Miembro agregado al equipo.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al agregar miembro' });
  }
};

// DELETE /api/admin/equipos/:equipoId/miembros/:participanteId
exports.removeMember = async (req, res) => {
  try {
    const { id, participanteId } = req.params;
    await sequelize.query(
      'DELETE FROM equipo_participante WHERE equipo_id = ? AND participante_id = ?',
      { replacements: [id, participanteId] }
    );
    res.json({ success: true, message: 'Miembro eliminado del equipo.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar miembro' });
  }
};
