const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('Rol', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'roles',
  paranoid: true
});

module.exports = Rol;
