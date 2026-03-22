const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  email_verified_at: { type: DataTypes.DATE, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: false },
  remember_token: { type: DataTypes.STRING(100), allowNull: true },
  avatar: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'users',
  paranoid: false
});

module.exports = User;
