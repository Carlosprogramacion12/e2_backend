const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Calificacion = sequelize.define('Calificacion', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  proyecto_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  juez_user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  criterio_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  puntuacion: { type: DataTypes.DECIMAL(5, 2), allowNull: false }
}, {
  tableName: 'calificaciones',
  paranoid: true
});

module.exports = Calificacion;
