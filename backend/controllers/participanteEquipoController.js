/**
 * Controlador de Equipos para Participante
 * Equivalente a Participante\EquipoController
 */
const { Equipo, Proyecto, Evento, Participante, User, Perfil, SolicitudEquipo, InvitacionEquipo, Carrera } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Rol } = require('../models');

// GET /api/participante/equipos/create
exports.createForm = async (req, res) => {
  try {
    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    const hasTeam = await sequelize.query(
      'SELECT COUNT(*) as c FROM equipo_participante WHERE participante_id = ?',
      { replacements: [participante.id], type: sequelize.QueryTypes.SELECT }
    );
    if (hasTeam[0].c > 0) return res.status(400).json({ success: false, message: 'Ya perteneces a un equipo.' });

    const eventosDisponibles = await Evento.findAll({
      where: { fecha_fin: { [Op.gte]: new Date() } }, order: [['fecha_inicio', 'ASC']]
    });
    res.json({ success: true, data: { eventosDisponibles } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// POST /api/participante/equipos
exports.store = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { evento_id, nombre_equipo, nombre_proyecto, descripcion_proyecto, repositorio_url } = req.body;
    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    if (!participante) { await t.rollback(); return res.status(400).json({ success: false, message: 'No tienes perfil de participante.' }); }

    const equipo = await Equipo.create({ nombre: nombre_equipo }, { transaction: t });
    await Proyecto.create({ equipo_id: equipo.id, evento_id, nombre: nombre_proyecto, descripcion: descripcion_proyecto, repositorio_url }, { transaction: t });

    const perfilLider = await Perfil.findOne({ where: { nombre: 'Líder de Proyecto' } });
    const idLider = perfilLider ? perfilLider.id : 3;

    await sequelize.query(
      'INSERT INTO equipo_participante (equipo_id, participante_id, perfil_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      { replacements: [equipo.id, participante.id, idLider], transaction: t }
    );

    await t.commit();
    res.status(201).json({ success: true, message: 'Equipo creado. Ahora agrega a tus compañeros.' });
  } catch (error) {
    await t.rollback();
    console.error('Error creando equipo:', error);
    res.status(500).json({ success: false, message: 'Error al crear equipo: ' + error.message });
  }
};

// GET /api/participante/equipos/join
exports.showJoinForm = async (req, res) => {
  try {
    const { evento_id } = req.query;
    const eventos = await Evento.findAll({ where: { fecha_fin: { [Op.gte]: new Date() } } });
    const perfiles = await Perfil.findAll({ where: { nombre: { [Op.ne]: 'Líder de Proyecto' } } });

    let whereClause = {};
    if (evento_id) {
      whereClause = { '$proyecto.evento_id$': evento_id };
    }

    const equiposDisponibles = await Equipo.findAll({
      include: [
        { model: Proyecto, as: 'proyecto', include: [{ model: Evento, as: 'evento' }], required: true },
        { model: Participante, as: 'participantes', through: { attributes: [] } }
      ],
      where: whereClause
    });

    res.json({ success: true, data: { equiposDisponibles, eventos, perfiles } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// GET /api/participante/equipos/edit
exports.edit = async (req, res) => {
  try {
    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    const equipo = await Equipo.findOne({
      include: [
        { model: Participante, as: 'participantes', where: { id: participante.id }, through: { attributes: ['perfil_id'] } }
      ]
    });
    if (!equipo) return res.status(400).json({ success: false, message: 'No tienes equipo.' });

    const equipoFull = await Equipo.findByPk(equipo.id, {
      include: [
        { model: Proyecto, as: 'proyecto', include: [{ model: Evento, as: 'evento' }] },
        { model: Participante, as: 'participantes', include: [{ model: Carrera, as: 'carrera' }, { model: User, as: 'user', attributes: ['id', 'name', 'email'] }], through: { attributes: ['perfil_id'] } }
      ]
    });

    // Candidatos: participantes sin equipo
    const candidatos = await Participante.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'], include: [{ model: Rol, as: 'roles', where: { nombre: 'Participante' }, through: { attributes: [] } }] },
        { model: Carrera, as: 'carrera' }
      ]
    });

    const conEquipo = await sequelize.query('SELECT DISTINCT participante_id FROM equipo_participante', { type: sequelize.QueryTypes.SELECT });
    const idsConEquipo = new Set(conEquipo.map(r => r.participante_id));

    const candidatosFiltrados = candidatos
      .filter(c => !idsConEquipo.has(c.id) && c.user_id !== req.user.id)
      .map(c => ({ id: c.id, name: c.user.name, no_control: c.no_control, carrera: c.carrera?.nombre }));

    const perfiles = await Perfil.findAll({ where: { nombre: { [Op.ne]: 'Líder de Proyecto' } } });

    res.json({ success: true, data: { equipo: equipoFull, candidatos: candidatosFiltrados, perfiles } });
  } catch (error) {
    console.error('Error edit equipo:', error);
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// PUT /api/participante/equipos/:id
exports.update = async (req, res) => {
  try {
    const equipo = await Equipo.findByPk(req.params.id);
    if (!equipo) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    const { nombre, nombre_proyecto, descripcion_proyecto, repositorio_url } = req.body;
    await equipo.update({ nombre });
    await Proyecto.update(
      { nombre: nombre_proyecto, descripcion: descripcion_proyecto, repositorio_url },
      { where: { equipo_id: equipo.id } }
    );
    res.json({ success: true, message: 'Equipo y proyecto actualizados.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
};

// POST /api/participante/equipos/add-member
exports.addMember = async (req, res) => {
  try {
    const { participante_id, perfil_id } = req.body;
    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    const equipo = await Equipo.findOne({
      include: [{ model: Participante, as: 'participantes', where: { id: participante.id }, through: { attributes: [] } }]
    });
    if (!equipo) return res.status(400).json({ success: false, message: 'No tienes equipo.' });

    const count = await sequelize.query(
      'SELECT COUNT(*) as c FROM equipo_participante WHERE equipo_id = ?',
      { replacements: [equipo.id], type: sequelize.QueryTypes.SELECT }
    );
    if (count[0].c >= 5) return res.status(400).json({ success: false, message: 'Equipo lleno (máx. 5).' });

    await sequelize.query(
      'INSERT INTO equipo_participante (equipo_id, participante_id, perfil_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      { replacements: [equipo.id, participante_id, perfil_id] }
    );
    res.json({ success: true, message: 'Participante agregado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al agregar miembro' });
  }
};

// DELETE /api/participante/equipos/remove-member/:id
exports.removeMember = async (req, res) => {
  try {
    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    const equipo = await Equipo.findOne({
      include: [{ model: Participante, as: 'participantes', where: { id: participante.id }, through: { attributes: [] } }]
    });
    if (req.params.id == participante.id) return res.status(400).json({ success: false, message: 'No puedes eliminarte a ti mismo.' });

    await sequelize.query('DELETE FROM equipo_participante WHERE equipo_id = ? AND participante_id = ?', { replacements: [equipo.id, req.params.id] });
    res.json({ success: true, message: 'Miembro eliminado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// DELETE /api/participante/equipos/leave
exports.leave = async (req, res) => {
  try {
    const participante = await Participante.findOne({ where: { user_id: req.user.id } });
    const equipo = await Equipo.findOne({
      include: [{ model: Participante, as: 'participantes', where: { id: participante.id }, through: { attributes: ['perfil_id'] } }]
    });
    if (!equipo) return res.status(400).json({ success: false, message: 'No perteneces a ningún equipo.' });

    const perfilId = equipo.participantes[0]?.equipo_participante?.perfil_id;
    if (perfilId === 3) return res.status(400).json({ success: false, message: 'Como líder, no puedes abandonar. Debes eliminar el equipo o asignar otro líder.' });

    await sequelize.query('DELETE FROM equipo_participante WHERE equipo_id = ? AND participante_id = ?', { replacements: [equipo.id, participante.id] });
    await InvitacionEquipo.update({ estado: 'rechazada', respondida_en: new Date() }, { where: { participante_id: participante.id, estado: { [Op.ne]: 'rechazada' } } });

    res.json({ success: true, message: 'Has abandonado el equipo.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al abandonar equipo' });
  }
};
