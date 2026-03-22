const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Proyecto = sequelize.define('Proyecto', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  equipo_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  evento_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  repositorio_url: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'proyectos',
  paranoid: true
});

module.exports = Proyecto;
