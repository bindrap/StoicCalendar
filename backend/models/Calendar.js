const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Calendar = sequelize.define('Calendar', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3174ad',
    comment: 'Color for calendar identification'
  },
  isShared: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this calendar is shared with other users'
  },
  sharedWith: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of user IDs who have access to this calendar'
  },
  permissions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Permissions map: { userId: "view" | "edit" }'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Default calendar for the user'
  }
}, {
  tableName: 'calendars',
  timestamps: true,
  indexes: [
    {
      fields: ['ownerId']
    },
    {
      fields: ['isShared']
    }
  ]
});

module.exports = Calendar;
