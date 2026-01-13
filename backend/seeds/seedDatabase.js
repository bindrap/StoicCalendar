const { sequelize } = require('../config/database');
const { Quote } = require('../models');
const stoicQuotes = require('./quotes');

const seedDatabase = async () => {
  try {
    console.log('Seeding database with stoic quotes...');

    const existingQuotes = await Quote.count();
    if (existingQuotes > 0) {
      console.log(`Database already has ${existingQuotes} quotes. Skipping seed.`);
      return;
    }

    await Quote.bulkCreate(stoicQuotes);
    console.log(`✓ Successfully seeded ${stoicQuotes.length} stoic quotes`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
