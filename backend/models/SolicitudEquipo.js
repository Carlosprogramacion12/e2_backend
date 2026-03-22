const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SolicitudEquipo = sequelize.define('SolicitudEquipo', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  equipo_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  participante_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  perfil_solicitado_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  mensaje: { type: DataTypes.TEXT, allowNull: true },
  estado: { type: DataTypes.STRING, defaultValue: 'pendiente' },
  respondida_por_participante_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  respondida_en: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'solicitudes_equipo',
  paranoid: false
});

module.exports = SolicitudEquipo;
