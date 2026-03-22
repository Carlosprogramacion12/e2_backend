const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Avance = sequelize.define('Avance', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  proyecto_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false }
}, {
  tableName: 'avances',
  paranoid: true
});

module.exports = Avance;
