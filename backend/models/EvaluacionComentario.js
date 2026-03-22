const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EvaluacionComentario = sequelize.define('EvaluacionComentario', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  proyecto_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  juez_user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  comentario: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'evaluacion_comentarios',
  paranoid: false
});

module.exports = EvaluacionComentario;
