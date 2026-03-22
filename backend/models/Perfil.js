const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Perfil = sequelize.define('Perfil', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'perfiles',
  paranoid: true
});

module.exports = Perfil;
