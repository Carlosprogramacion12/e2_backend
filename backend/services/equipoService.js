/**
 * Servicio de lógica de equipos
 * Replica la lógica del modelo Equipo de Laravel
 */
const { Equipo, Participante, Perfil, User } = require('../models');
const sequelize = require('../config/database');

/**
 * Obtiene el conteo de roles de un equipo
 */
async function getConteoRoles(equipoId) {
  const equipo = await Equipo.findByPk(equipoId, {
    include: [{
      model: Participante, as: 'participantes',
      through: { attributes: ['perfil_id'] }
    }]
  });

  if (!equipo) return null;

  const conteo = { programadores: 0, disenadores: 0, testers: 0, lider: 0 };

  equipo.participantes.forEach(p => {
    const perfilId = p.equipo_participante?.perfil_id;
    switch (perfilId) {
      case 1: conteo.programadores++; break;
      case 2: conteo.disenadores++; break;
      case 3: conteo.lider++; break;
      case 4: conteo.testers++; break;
    }
  });

  return conteo;
}

/**
 * Verifica si hay vacantes para un rol específico
 */
async function tieneVacantesParaRol(equipoId, perfilId) {
  const equipo = await Equipo.findByPk(equipoId);
  const conteo = await getConteoRoles(equipoId);
  if (!equipo || !conteo) return false;

  switch (perfilId) {
    case 1: return conteo.programadores < equipo.max_programadores;
    case 2: return conteo.disenadores < equipo.max_disenadores;
    case 4: return conteo.testers < equipo.max_testers;
    default: return false;
  }
}

/**
 * Obtiene roles disponibles con vacantes
 */
async function getRolesDisponibles(equipoId) {
  const equipo = await Equipo.findByPk(equipoId);
  const conteo = await getConteoRoles(equipoId);
  if (!equipo || !conteo) return [];

  const roles = [];

  const progDisp = Math.max(0, equipo.max_programadores - conteo.programadores);
  if (progDisp > 0) roles.push({ id: 1, nombre: 'Programador', disponibles: progDisp, total: equipo.max_programadores });

  const disDisp = Math.max(0, equipo.max_disenadores - conteo.disenadores);
  if (disDisp > 0) roles.push({ id: 2, nombre: 'Diseñador', disponibles: disDisp, total: equipo.max_disenadores });

  const testDisp = Math.max(0, equipo.max_testers - conteo.testers);
  if (testDisp > 0) roles.push({ id: 4, nombre: 'Tester', disponibles: testDisp, total: equipo.max_testers });

  return roles;
}

/**
 * Obtiene el líder de un equipo
 */
async function getLider(equipoId) {
  const equipo = await Equipo.findByPk(equipoId, {
    include: [{
      model: Participante, as: 'participantes',
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      through: { where: { perfil_id: 3 }, attributes: ['perfil_id'] }
    }]
  });

  return equipo?.participantes?.[0] || null;
}

/**
 * Remueve integrante con posible sucesión de líder
 */
async function removerIntegrante(equipoId, participanteId) {
  const equipo = await Equipo.findByPk(equipoId, {
    include: [{
      model: Participante, as: 'participantes',
      through: { attributes: ['perfil_id', 'created_at'] }
    }]
  });

  if (!equipo) throw new Error('Equipo no encontrado');

  // Verificar si el que se va es líder
  const miembro = equipo.participantes.find(p => p.id == participanteId);
  const esLider = miembro?.equipo_participante?.perfil_id === 3;

  // Eliminar al participante del equipo
  await sequelize.models.equipo_participante?.destroy({
    where: { equipo_id: equipoId, participante_id: participanteId }
  });

  // Si no se puede usar el modelo directamente, usamos query raw
  await sequelize.query(
    'DELETE FROM equipo_participante WHERE equipo_id = ? AND participante_id = ?',
    { replacements: [equipoId, participanteId] }
  );

  // Sucesión de líder
  if (esLider) {
    const [nuevoLider] = await sequelize.query(
      `SELECT participante_id FROM equipo_participante 
       WHERE equipo_id = ? ORDER BY created_at ASC LIMIT 1`,
      { replacements: [equipoId], type: sequelize.QueryTypes.SELECT }
    );

    if (nuevoLider) {
      await sequelize.query(
        `UPDATE equipo_participante SET perfil_id = 3 
         WHERE equipo_id = ? AND participante_id = ?`,
        { replacements: [equipoId, nuevoLider.participante_id] }
      );
    }
  }
}

module.exports = { getConteoRoles, tieneVacantesParaRol, getRolesDisponibles, getLider, removerIntegrante };
