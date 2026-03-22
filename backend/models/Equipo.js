const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipo = sequelize.define('Equipo', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false, unique: true },
  max_programadores: { type: DataTypes.INTEGER, defaultValue: 2 },
  max_disenadores: { type: DataTypes.INTEGER, defaultValue: 1 },
  max_testers: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
  tableName: 'equipos',
  paranoid: true
});

module.exports = Equipo;
