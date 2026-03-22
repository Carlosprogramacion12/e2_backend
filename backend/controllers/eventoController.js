/**
 * Controlador CRUD de Eventos
 * Equivalente a Admin\EventoController
 */
const { Evento, User, Rol, CriterioEvaluacion } = require('../models');
const { Op } = require('sequelize');

// GET /api/admin/eventos
exports.index = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Evento.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        eventos: rows,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al listar eventos' });
  }
};

// POST /api/admin/eventos
exports.store = async (req, res) => {
  try {
    const { nombre, descripcion, fecha_inicio, fecha_fin, jueces } = req.body;

    if (!nombre || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ success: false, message: 'Nombre, fecha inicio y fecha fin son requeridos' });
    }

    const evento = await Evento.create({ nombre, descripcion, fecha_inicio, fecha_fin });

    if (jueces && Array.isArray(jueces) && jueces.length > 0) {
      await evento.addJueces(jueces);
    }

    res.status(201).json({ success: true, message: 'Evento creado exitosamente.', data: evento });
  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({ success: false, message: 'Error al crear evento' });
  }
};

// GET /api/admin/eventos/:id
exports.show = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id, {
      include: [
        { model: CriterioEvaluacion, as: 'criterios' },
        { model: User, as: 'jueces', through: { attributes: [] }, attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

    res.json({ success: true, data: evento });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener evento' });
  }
};

// PUT /api/admin/eventos/:id
exports.update = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

    const { nombre, descripcion, fecha_inicio, fecha_fin, jueces } = req.body;
    await evento.update({ nombre, descripcion, fecha_inicio, fecha_fin });

    if (jueces && Array.isArray(jueces)) {
      await evento.setJueces(jueces);
    }

    res.json({ success: true, message: 'Evento actualizado exitosamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar evento' });
  }
};

// DELETE /api/admin/eventos/:id
exports.destroy = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

    await evento.destroy();
    res.json({ success: true, message: 'Evento eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar evento' });
  }
};

// Jueces disponibles para asignar
exports.getJueces = async (req, res) => {
  try {
    const jueces = await User.findAll({
      include: [{ model: Rol, as: 'roles', where: { nombre: 'Juez' }, through: { attributes: [] } }],
      attributes: ['id', 'name', 'email']
    });
    res.json({ success: true, data: jueces });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener jueces' });
  }
};
