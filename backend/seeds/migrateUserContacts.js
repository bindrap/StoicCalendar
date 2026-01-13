const { User, ContactInfo } = require('../models');

/**
 * Migrate existing user email/phone to ContactInfo table
 * This is a one-time migration to populate the new contacts system
 */
const migrateUserContacts = async () => {
  try {
    console.log('Migrating user contacts to ContactInfo table...');

    const users = await User.findAll();

    for (const user of users) {
      // Migrate email if exists
      if (user.email) {
        const existingEmail = await ContactInfo.findOne({
          where: {
            userId: user.id,
            type: 'email',
            value: user.email
          }
        });

        if (!existingEmail) {
          await ContactInfo.create({
            userId: user.id,
            type: 'email',
            value: user.email,
            isPrimary: true,
            receiveNotifications: true,
            label: 'Primary'
          });
          console.log(`✓ Migrated email for user ${user.email}`);
        }
      }

      // Migrate phone if exists
      if (user.phone) {
        const existingPhone = await ContactInfo.findOne({
          where: {
            userId: user.id,
            type: 'phone',
            value: user.phone
          }
        });

        if (!existingPhone) {
          await ContactInfo.create({
            userId: user.id,
            type: 'phone',
            value: user.phone,
            isPrimary: true,
            receiveNotifications: true,
            label: 'Primary'
          });
          console.log(`✓ Migrated phone for user ${user.email}`);
        }
      }
    }

    console.log('✓ User contacts migration completed');
  } catch (error) {
    console.error('Error migrating user contacts:', error);
    throw error;
  }
};

if (require.main === module) {
  migrateUserContacts()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateUserContacts;
