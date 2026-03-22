/**
 * Controlador de Criterios de Evaluación
 * Equivalente a Admin\CriterioController
 */
const { CriterioEvaluacion, Evento } = require('../models');

// POST /api/admin/eventos/:eventoId/criterios
exports.store = async (req, res) => {
  try {
    const { nombre, ponderacion } = req.body;
    const criterio = await CriterioEvaluacion.create({
      evento_id: req.params.eventoId,
      nombre,
      ponderacion
    });
    res.status(201).json({ success: true, message: 'Criterio creado.', data: criterio });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear criterio' });
  }
};

// PUT /api/admin/criterios/:id
exports.update = async (req, res) => {
  try {
    const criterio = await CriterioEvaluacion.findByPk(req.params.id);
    if (!criterio) return res.status(404).json({ success: false, message: 'Criterio no encontrado' });

    await criterio.update(req.body);
    res.json({ success: true, message: 'Criterio actualizado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar criterio' });
  }
};

// DELETE /api/admin/criterios/:id
exports.destroy = async (req, res) => {
  try {
    const criterio = await CriterioEvaluacion.findByPk(req.params.id);
    if (!criterio) return res.status(404).json({ success: false, message: 'Criterio no encontrado' });

    await criterio.destroy();
    res.json({ success: true, message: 'Criterio eliminado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar criterio' });
  }
};

// GET /api/admin/criterios/:id
exports.show = async (req, res) => {
  try {
    const criterio = await CriterioEvaluacion.findByPk(req.params.id, {
      include: [{ model: Evento, as: 'evento' }]
    });
    if (!criterio) return res.status(404).json({ success: false, message: 'Criterio no encontrado' });

    res.json({ success: true, data: criterio });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener criterio' });
  }
};
