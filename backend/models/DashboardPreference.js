const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DashboardPreference = sequelize.define('DashboardPreference', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  widget_key: { type: DataTypes.STRING, allowNull: false },
  position: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_visible: { type: DataTypes.BOOLEAN, defaultValue: true },
  settings: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('settings');
      return raw ? JSON.parse(raw) : {};
    },
    set(val) {
      this.setDataValue('settings', JSON.stringify(val));
    }
  }
}, {
  tableName: 'dashboard_preferences',
  paranoid: false
});

module.exports = DashboardPreference;
