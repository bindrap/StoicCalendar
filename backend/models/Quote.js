const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quote = sequelize.define('Quote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateUsed: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'quotes',
  timestamps: true,
  indexes: [
    {
      fields: ['dateUsed']
    }
  ]
});

module.exports = Quote;
