/**
 * Controladores CRUD de Carreras y Perfiles (Admin)
 */
const { Carrera, Perfil } = require('../models');

// ─── CARRERAS ───
exports.carrerasIndex = async (req, res) => {
  try {
    const carreras = await Carrera.findAll({ order: [['nombre', 'ASC']] });
    res.json({ success: true, data: carreras });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al listar carreras' });
  }
};

exports.carrerasStore = async (req, res) => {
  try {
    const carrera = await Carrera.create(req.body);
    res.status(201).json({ success: true, message: 'Carrera creada.', data: carrera });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear carrera' });
  }
};

exports.carrerasUpdate = async (req, res) => {
  try {
    const carrera = await Carrera.findByPk(req.params.id);
    if (!carrera) return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
    await carrera.update(req.body);
    res.json({ success: true, message: 'Carrera actualizada.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar carrera' });
  }
};

exports.carrerasDestroy = async (req, res) => {
  try {
    const carrera = await Carrera.findByPk(req.params.id);
    if (!carrera) return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
    await carrera.destroy();
    res.json({ success: true, message: 'Carrera eliminada.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar carrera' });
  }
};

// ─── PERFILES ───
exports.perfilesIndex = async (req, res) => {
  try {
    const perfiles = await Perfil.findAll({ order: [['nombre', 'ASC']] });
    res.json({ success: true, data: perfiles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al listar perfiles' });
  }
};

exports.perfilesStore = async (req, res) => {
  try {
    const perfil = await Perfil.create(req.body);
    res.status(201).json({ success: true, message: 'Perfil creado.', data: perfil });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear perfil' });
  }
};

exports.perfilesUpdate = async (req, res) => {
  try {
    const perfil = await Perfil.findByPk(req.params.id);
    if (!perfil) return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
    await perfil.update(req.body);
    res.json({ success: true, message: 'Perfil actualizado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
  }
};

exports.perfilesDestroy = async (req, res) => {
  try {
    const perfil = await Perfil.findByPk(req.params.id);
    if (!perfil) return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
    await perfil.destroy();
    res.json({ success: true, message: 'Perfil eliminado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar perfil' });
  }
};
