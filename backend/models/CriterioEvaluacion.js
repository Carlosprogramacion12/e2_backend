const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CriterioEvaluacion = sequelize.define('CriterioEvaluacion', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  evento_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  nombre: { type: DataTypes.STRING, allowNull: false },
  ponderacion: { type: DataTypes.DECIMAL(5, 2), allowNull: false }
}, {
  tableName: 'criterio_evaluacion',
  paranoid: true
});

module.exports = CriterioEvaluacion;
