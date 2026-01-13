const User = require('./User');
const Event = require('./Event');
const Quote = require('./Quote');
const Notification = require('./Notification');
const ContactInfo = require('./ContactInfo');
const Calendar = require('./Calendar');

// Define relationships
User.hasMany(Event, { foreignKey: 'userId', onDelete: 'CASCADE' });
Event.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Calendar, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Calendar.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Calendar.hasMany(Event, { foreignKey: 'calendarId', onDelete: 'CASCADE' });
Event.belongsTo(Calendar, { foreignKey: 'calendarId' });

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Event.hasMany(Notification, { foreignKey: 'eventId', onDelete: 'SET NULL' });
Notification.belongsTo(Event, { foreignKey: 'eventId' });

User.hasMany(ContactInfo, { foreignKey: 'userId', onDelete: 'CASCADE' });
ContactInfo.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Event,
  Quote,
  Notification,
  ContactInfo,
  Calendar
};
