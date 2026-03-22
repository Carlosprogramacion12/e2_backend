const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EquipoParticipante = sequelize.define('EquipoParticipante', {
  equipo_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, references: { model: 'equipos', key: 'id' } },
  participante_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, references: { model: 'participantes', key: 'id' } },
  perfil_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'perfiles', key: 'id' } }
}, {
  tableName: 'equipo_participante',
  timestamps: true
});

module.exports = EquipoParticipante;
