const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvitacionEquipo = sequelize.define('InvitacionEquipo', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  equipo_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  participante_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  perfil_sugerido_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  mensaje: { type: DataTypes.TEXT, allowNull: true },
  estado: { type: DataTypes.STRING, defaultValue: 'pendiente' },
  enviada_por_participante_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  respondida_en: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'invitaciones_equipo',
  paranoid: false
});

module.exports = InvitacionEquipo;
