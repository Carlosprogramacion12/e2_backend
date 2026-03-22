const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carrera = sequelize.define('Carrera', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  clave: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'carreras',
  paranoid: true
});

module.exports = Carrera;
