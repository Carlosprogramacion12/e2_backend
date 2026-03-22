const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Constancia = sequelize.define('Constancia', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  participante_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  evento_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: false },
  archivo_path: { type: DataTypes.STRING, allowNull: true },
  codigo_qr: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'constancias',
  paranoid: true
});

module.exports = Constancia;
