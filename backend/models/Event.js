const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  calendarId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'calendars',
      key: 'id'
    },
    comment: 'Calendar this event belongs to (null for default calendar)'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  reminderTime: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
    comment: 'Minutes before event to send reminder'
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3174ad'
  },
  isImportant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Important events get both email and SMS notifications'
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringPattern: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Pattern for recurring events: {frequency: daily|weekly|monthly|yearly, interval: 1, daysOfWeek: [0-6], endDate: ISO8601, count: number}'
  },
  recurringEventId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'events',
      key: 'id'
    },
    comment: 'Reference to parent recurring event (null for parent events)'
  },
  originalStartTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Original start time for recurring instances (used to identify which instance)'
  }
}, {
  tableName: 'events',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['startTime']
    }
  ]
});

module.exports = Event;
