const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactInfo = sequelize.define('ContactInfo', {
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
  type: {
    type: DataTypes.ENUM('email', 'phone'),
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Primary contact for this type'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this contact has been verified'
  },
  receiveNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether to send notifications to this contact'
  },
  label: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Optional label like "Work", "Personal", etc.'
  }
}, {
  tableName: 'contact_info',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['type']
    },
    {
      unique: true,
      fields: ['userId', 'type', 'value']
    }
  ],
  validate: {
    validEmail() {
      if (this.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value)) {
          throw new Error('Invalid email format');
        }
      }
    },
    validPhone() {
      if (this.type === 'phone') {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(this.value.replace(/[\s\-\(\)]/g, ''))) {
          throw new Error('Invalid phone format');
        }
      }
    }
  }
});

module.exports = ContactInfo;
