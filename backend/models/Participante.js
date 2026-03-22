const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Participante = sequelize.define('Participante', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  carrera_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  no_control: { type: DataTypes.STRING, allowNull: true },
  telefono: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'participantes',
  paranoid: true
});

module.exports = Participante;
