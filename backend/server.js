const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const seedDatabase = require('./seeds/seedDatabase');
const migrateUserContacts = require('./seeds/migrateUserContacts');
const seedCalendars = require('./seeds/seedCalendars');
const reminderService = require('./services/reminderService');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const quoteRoutes = require('./routes/quotes');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contacts');
const calendarRoutes = require('./routes/calendars');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/calendars', calendarRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Stoic Calendar API is running' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const startServer = async () => {
  try {
    await testConnection();

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✓ Database synchronized');

    await seedDatabase();
    await migrateUserContacts();
    await seedCalendars();

    reminderService.start();

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
