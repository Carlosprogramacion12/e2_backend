/**
 * Controlador de Avances (Bitácora)
 * Equivalente a Participante\AvanceController
 */
const { Avance, Proyecto, Equipo, Participante } = require('../models');
const sequelize = require('../config/database');

// GET /api/participante/avances
exports.index = async (req, res) => {
  try {
    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    const equipo = await Equipo.findOne({
      include: [{ model: Participante, as: 'participantes', where: { id: participante.id }, through: { attributes: [] } }]
    });
    if (!equipo) return res.status(400).json({ success: false, message: 'No tienes equipo.' });

    const proyecto = await Proyecto.findOne({ where: { equipo_id: equipo.id } });
    if (!proyecto) return res.status(400).json({ success: false, message: 'No tienes proyecto.' });

    const avances = await Avance.findAll({
      where: { proyecto_id: proyecto.id },
      order: [['fecha', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({ success: true, data: { avances, proyecto } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener avances' });
  }
};

// POST /api/participante/avances
exports.store = async (req, res) => {
  try {
    const { descripcion, fecha } = req.body;
    if (!descripcion || !fecha) return res.status(400).json({ success: false, message: 'Descripción y fecha requeridos' });

    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    const equipo = await Equipo.findOne({
      include: [{ model: Participante, as: 'participantes', where: { id: participante.id }, through: { attributes: [] } }]
    });
    const proyecto = await Proyecto.findOne({ where: { equipo_id: equipo.id } });

    const avance = await Avance.create({ proyecto_id: proyecto.id, descripcion, fecha });
    res.status(201).json({ success: true, message: 'Avance registrado.', data: avance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar avance' });
  }
};

// DELETE /api/participante/avances/:id
exports.destroy = async (req, res) => {
  try {
    const avance = await Avance.findByPk(req.params.id);
    if (!avance) return res.status(404).json({ success: false, message: 'Avance no encontrado' });
    await avance.destroy();
    res.json({ success: true, message: 'Avance eliminado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar avance' });
  }
};
