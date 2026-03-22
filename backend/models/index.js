/**
 * Modelo Index: Define todas las asociaciones entre modelos
 * Equivalente a las relaciones de Eloquent en Laravel
 */
const User = require('./User');
const Rol = require('./Rol');
const Participante = require('./Participante');
const Carrera = require('./Carrera');
const Perfil = require('./Perfil');
const Equipo = require('./Equipo');
const Proyecto = require('./Proyecto');
const Evento = require('./Evento');
const CriterioEvaluacion = require('./CriterioEvaluacion');
const Calificacion = require('./Calificacion');
const Avance = require('./Avance');
const Constancia = require('./Constancia');
const SolicitudEquipo = require('./SolicitudEquipo');
const InvitacionEquipo = require('./InvitacionEquipo');
const EvaluacionComentario = require('./EvaluacionComentario');
const DashboardPreference = require('./DashboardPreference');
const EquipoParticipante = require('./EquipoParticipante');
const sequelize = require('../config/database');

// ─── User ↔ Rol (M:M via user_rol) ───
User.belongsToMany(Rol, { through: 'user_rol', foreignKey: 'user_id', otherKey: 'rol_id', as: 'roles', timestamps: false });
Rol.belongsToMany(User, { through: 'user_rol', foreignKey: 'rol_id', otherKey: 'user_id', as: 'users', timestamps: false });

// ─── User → Participante (1:1) ───
User.hasOne(Participante, { foreignKey: 'user_id', as: 'participante' });
Participante.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── Participante → Carrera ───
Participante.belongsTo(Carrera, { foreignKey: 'carrera_id', as: 'carrera' });
Carrera.hasMany(Participante, { foreignKey: 'carrera_id', as: 'participantes' });

// ─── Participante ↔ Equipo (M:M via equipo_participante) ───
Participante.belongsToMany(Equipo, {
  through: EquipoParticipante,
  foreignKey: 'participante_id',
  otherKey: 'equipo_id',
  as: 'equipos'
});
Equipo.belongsToMany(Participante, {
  through: EquipoParticipante,
  foreignKey: 'equipo_id',
  otherKey: 'participante_id',
  as: 'participantes'
});
EquipoParticipante.belongsTo(Perfil, { foreignKey: 'perfil_id', as: 'perfil' });

// ─── Equipo → Proyecto (1:1) ───
Equipo.hasOne(Proyecto, { foreignKey: 'equipo_id', as: 'proyecto' });
Proyecto.belongsTo(Equipo, { foreignKey: 'equipo_id', as: 'equipo' });

// ─── Evento → Proyecto (1:N) ───
Evento.hasMany(Proyecto, { foreignKey: 'evento_id', as: 'proyectos' });
Proyecto.belongsTo(Evento, { foreignKey: 'evento_id', as: 'evento' });

// ─── Evento → CriterioEvaluacion (1:N) ───
Evento.hasMany(CriterioEvaluacion, { foreignKey: 'evento_id', as: 'criterios' });
CriterioEvaluacion.belongsTo(Evento, { foreignKey: 'evento_id', as: 'evento' });

// ─── Evento → Constancia (1:N) ───
Evento.hasMany(Constancia, { foreignKey: 'evento_id', as: 'constancias' });
Constancia.belongsTo(Evento, { foreignKey: 'evento_id', as: 'evento' });

// ─── Evento → Equipo (1:N) — indirecto via Proyecto, o directo si hay FK ───
// En el modelo Laravel Evento hasMany Equipo, pero en la BD no hay FK directa.
// Se accede via Proyecto. No definimos asociación directa aquí.

// ─── Evento ↔ User/Juez (M:M via evento_user) ───
Evento.belongsToMany(User, { through: 'evento_user', foreignKey: 'evento_id', otherKey: 'user_id', as: 'jueces', timestamps: false });
User.belongsToMany(Evento, { through: 'evento_user', foreignKey: 'user_id', otherKey: 'evento_id', as: 'eventosAsignados', timestamps: false });

// ─── Proyecto → Calificacion (1:N) ───
Proyecto.hasMany(Calificacion, { foreignKey: 'proyecto_id', as: 'calificaciones' });
Calificacion.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto' });

// ─── CriterioEvaluacion → Calificacion (1:N) ───
CriterioEvaluacion.hasMany(Calificacion, { foreignKey: 'criterio_id', as: 'calificaciones' });
Calificacion.belongsTo(CriterioEvaluacion, { foreignKey: 'criterio_id', as: 'criterio' });

// ─── User/Juez → Calificacion (1:N) ───
User.hasMany(Calificacion, { foreignKey: 'juez_user_id', as: 'calificaciones' });
Calificacion.belongsTo(User, { foreignKey: 'juez_user_id', as: 'juez' });

// ─── Proyecto → Avance (1:N) ───
Proyecto.hasMany(Avance, { foreignKey: 'proyecto_id', as: 'avances' });
Avance.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto' });

// ─── Proyecto → EvaluacionComentario (1:N) ───
Proyecto.hasMany(EvaluacionComentario, { foreignKey: 'proyecto_id', as: 'comentarios' });
EvaluacionComentario.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto' });
EvaluacionComentario.belongsTo(User, { foreignKey: 'juez_user_id', as: 'juez' });

// ─── Participante → Constancia (1:N) ───
Participante.hasMany(Constancia, { foreignKey: 'participante_id', as: 'constancias' });
Constancia.belongsTo(Participante, { foreignKey: 'participante_id', as: 'participante' });

// ─── Equipo → SolicitudEquipo (1:N) ───
Equipo.hasMany(SolicitudEquipo, { foreignKey: 'equipo_id', as: 'solicitudes' });
SolicitudEquipo.belongsTo(Equipo, { foreignKey: 'equipo_id', as: 'equipo' });
SolicitudEquipo.belongsTo(Participante, { foreignKey: 'participante_id', as: 'participante' });
SolicitudEquipo.belongsTo(Participante, { foreignKey: 'respondida_por_participante_id', as: 'respondidaPor' });
SolicitudEquipo.belongsTo(Perfil, { foreignKey: 'perfil_solicitado_id', as: 'perfilSugerido' });
Participante.hasMany(SolicitudEquipo, { foreignKey: 'participante_id', as: 'solicitudes' });

// ─── Equipo → InvitacionEquipo (1:N) ───
Equipo.hasMany(InvitacionEquipo, { foreignKey: 'equipo_id', as: 'invitaciones' });
InvitacionEquipo.belongsTo(Equipo, { foreignKey: 'equipo_id', as: 'equipo' });
InvitacionEquipo.belongsTo(Participante, { foreignKey: 'participante_id', as: 'participante' });
InvitacionEquipo.belongsTo(Participante, { foreignKey: 'enviada_por_participante_id', as: 'enviadaPor' });
InvitacionEquipo.belongsTo(Perfil, { foreignKey: 'perfil_sugerido_id', as: 'perfilSugerido' });
Participante.hasMany(InvitacionEquipo, { foreignKey: 'participante_id', as: 'invitaciones' });

// ─── User → DashboardPreference (1:N) ───
User.hasMany(DashboardPreference, { foreignKey: 'user_id', as: 'dashboardPreferences' });
DashboardPreference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Rol,
  Participante,
  Carrera,
  Perfil,
  Equipo,
  Proyecto,
  Evento,
  CriterioEvaluacion,
  Calificacion,
  Avance,
  Constancia,
  SolicitudEquipo,
  InvitacionEquipo,
  EvaluacionComentario,
  DashboardPreference,
  EquipoParticipante
};
