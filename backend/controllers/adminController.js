/**
 * Controlador Admin Dashboard
 * Equivalente a Admin\AdminController
 */
const { User, Equipo, Evento, Proyecto, Calificacion, DashboardPreference, Participante, Carrera } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { generarReporteDashboard } = require('../services/pdfService');

// GET /api/admin/dashboard
exports.index = async (req, res) => {
  try {
    // Conteos principales
    const total_jueces = await User.count({
      include: [{ model: require('../models/Rol'), as: 'roles', where: { nombre: 'Juez' }, through: { attributes: [] } }]
    });
    const total_participantes = await User.count({
      include: [{ model: require('../models/Rol'), as: 'roles', where: { nombre: 'Participante' }, through: { attributes: [] } }]
    });
    const total_equipos = await Equipo.count();
    const total_proyectos = await Proyecto.count();

    // Eventos activos
    const eventos_activos = await Evento.findAll({
      where: { fecha_fin: { [Op.gte]: new Date() } },
      order: [['fecha_inicio', 'ASC']]
    });

    // Participantes por carrera
    const participantesPorCarrera = await sequelize.query(`
      SELECT c.nombre, COUNT(*) as total
      FROM participantes p
      JOIN carreras c ON p.carrera_id = c.id
      WHERE p.deleted_at IS NULL AND c.deleted_at IS NULL
      GROUP BY c.nombre
    `, { type: sequelize.QueryTypes.SELECT });

    const carreraMap = {};
    participantesPorCarrera.forEach(row => { carreraMap[row.nombre] = row.total; });

    // Proyectos evaluados
    const proyectosEvaluados = await Proyecto.count({
      include: [{ model: Calificacion, as: 'calificaciones', required: true }],
      distinct: true
    });
    const proyectosPendientes = total_proyectos - proyectosEvaluados;

    // Estadísticas por evento
    const todos_eventos = await Evento.findAll({
      include: [{ model: Proyecto, as: 'proyectos', include: [{ model: Calificacion, as: 'calificaciones' }] }]
    });

    const eventos_stats = todos_eventos.map(evento => {
      const totalProyectos = evento.proyectos.length;
      const evaluados = evento.proyectos.filter(p => p.calificaciones.length > 0).length;
      return {
        id: evento.id,
        nombre: evento.nombre,
        total: totalProyectos,
        evaluados,
        pendientes: totalProyectos - evaluados
      };
    });

    // Widget preferences
    const defaultWidgets = [
      { key: 'stats_users', position: 0, is_visible: true, settings: {} },
      { key: 'stats_equipos', position: 1, is_visible: true, settings: {} },
      { key: 'stats_proyectos', position: 2, is_visible: true, settings: {} },
      { key: 'stats_eventos', position: 3, is_visible: true, settings: {} },
      { key: 'chart_evaluacion', position: 4, is_visible: true, settings: { type: 'bar', event_id: null } },
      { key: 'chart_carreras', position: 5, is_visible: true, settings: { type: 'doughnut' } },
      { key: 'list_eventos', position: 6, is_visible: true, settings: {} },
      { key: 'chart_pendientes_anual', position: 7, is_visible: false, settings: { type: 'line' } },
      { key: 'chart_categorias', position: 8, is_visible: false, settings: { type: 'bar' } }
    ];

    const userPrefs = await DashboardPreference.findAll({ where: { user_id: req.user.id } });
    const prefsMap = {};
    userPrefs.forEach(p => { prefsMap[p.widget_key] = p; });

    const widgets = defaultWidgets.map(def => {
      if (prefsMap[def.key]) {
        const pref = prefsMap[def.key];
        return {
          key: def.key,
          position: pref.position,
          is_visible: pref.is_visible,
          settings: { ...def.settings, ...(pref.settings || {}) }
        };
      }
      return def;
    }).sort((a, b) => a.position - b.position);

    res.json({
      success: true,
      data: {
        total_jueces,
        total_participantes,
        total_equipos,
        total_proyectos,
        eventos_activos,
        participantesPorCarrera: carreraMap,
        proyectosEvaluados,
        proyectosPendientes,
        widgets,
        eventos_stats,
        pendientesAnual: {
          '2021': 12, '2022': 8, '2023': 15, '2024': 5, '2025': proyectosPendientes
        }
      }
    });
  } catch (error) {
    console.error('Error dashboard admin:', error);
    res.status(500).json({ success: false, message: 'Error al cargar dashboard' });
  }
};

// POST /api/admin/dashboard/preferences
exports.savePreferences = async (req, res) => {
  try {
    const { widgets } = req.body;
    if (!Array.isArray(widgets)) {
      return res.status(400).json({ success: false, message: 'Widgets debe ser un array' });
    }

    for (const w of widgets) {
      await DashboardPreference.upsert({
        user_id: req.user.id,
        widget_key: w.key,
        position: w.position,
        is_visible: w.is_visible,
        settings: w.settings || {}
      });
    }

    res.json({ success: true, message: 'Preferencias guardadas correctamente.' });
  } catch (error) {
    console.error('Error guardando preferencias:', error);
    res.status(500).json({ success: false, message: 'Error al guardar preferencias' });
  }
};

// GET /api/admin/dashboard/report
exports.generateReport = async (req, res) => {
  try {
    const Rol = require('../models/Rol');
    const total_jueces = await User.count({
      include: [{ model: Rol, as: 'roles', where: { nombre: 'Juez' }, through: { attributes: [] } }]
    });
    const total_participantes = await User.count({
      include: [{ model: Rol, as: 'roles', where: { nombre: 'Participante' }, through: { attributes: [] } }]
    });
    const total_equipos = await Equipo.count();
    const total_proyectos = await Proyecto.count();
    const proyectosEvaluados = await Proyecto.count({
      include: [{ model: Calificacion, as: 'calificaciones', required: true }],
      distinct: true
    });
    const proyectosPendientes = total_proyectos - proyectosEvaluados;

    const eventos_activos = await Evento.findAll({
      where: { fecha_fin: { [Op.gte]: new Date() } },
      order: [['fecha_inicio', 'ASC']]
    });

    const ppCarrera = await sequelize.query(`
      SELECT c.nombre, COUNT(*) as total FROM participantes p
      JOIN carreras c ON p.carrera_id = c.id
      WHERE p.deleted_at IS NULL AND c.deleted_at IS NULL
      GROUP BY c.nombre
    `, { type: sequelize.QueryTypes.SELECT });

    const carreraMap = {};
    ppCarrera.forEach(r => { carreraMap[r.nombre] = r.total; });

    generarReporteDashboard(res, {
      total_jueces, total_participantes, total_equipos, total_proyectos,
      proyectosEvaluados, proyectosPendientes,
      eventos_activos, participantesPorCarrera: carreraMap
    });
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ success: false, message: 'Error al generar reporte' });
  }
};
