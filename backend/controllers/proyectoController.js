/**
 * Controlador CRUD de Proyectos (Admin)
 * Equivalente a Admin\ProyectoController
 */
const { Proyecto, Equipo, Evento, Calificacion } = require('../models');

// GET /api/admin/proyectos
exports.index = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Proyecto.findAndCountAll({
      include: [
        { model: Equipo, as: 'equipo' },
        { model: Evento, as: 'evento' }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      success: true,
      data: {
        proyectos: rows,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al listar proyectos' });
  }
};

// GET /api/admin/proyectos/:id
exports.show = async (req, res) => {
  try {
    const proyecto = await Proyecto.findByPk(req.params.id, {
      include: [
        { model: Equipo, as: 'equipo' },
        { model: Evento, as: 'evento' },
        { model: Calificacion, as: 'calificaciones' }
      ]
    });

    if (!proyecto) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    res.json({ success: true, data: proyecto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener proyecto' });
  }
};

// POST /api/admin/proyectos
exports.store = async (req, res) => {
  try {
    const { equipo_id, evento_id, nombre, descripcion, repositorio_url } = req.body;
    const proyecto = await Proyecto.create({ equipo_id, evento_id, nombre, descripcion, repositorio_url });
    res.status(201).json({ success: true, message: 'Proyecto creado.', data: proyecto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear proyecto' });
  }
};

// PUT /api/admin/proyectos/:id
exports.update = async (req, res) => {
  try {
    const proyecto = await Proyecto.findByPk(req.params.id);
    if (!proyecto) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });

    await proyecto.update(req.body);
    res.json({ success: true, message: 'Proyecto actualizado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar proyecto' });
  }
};

// DELETE /api/admin/proyectos/:id
exports.destroy = async (req, res) => {
  try {
    const proyecto = await Proyecto.findByPk(req.params.id);
    if (!proyecto) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });

    await proyecto.destroy();
    res.json({ success: true, message: 'Proyecto eliminado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar proyecto' });
  }
};
