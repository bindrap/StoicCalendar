const { User, Calendar, Event } = require('../models');

const seedCalendars = async () => {
  try {
    console.log('Seeding calendars...');

    // Get all users
    const users = await User.findAll();

    if (users.length === 0) {
      console.log('No users found. Skipping calendar seed.');
      return;
    }

    // Create default calendar for each user if they don't have one
    for (const user of users) {
      const existingCalendars = await Calendar.findAll({ where: { ownerId: user.id } });

      if (existingCalendars.length === 0) {
        const defaultCalendar = await Calendar.create({
          ownerId: user.id,
          name: 'My Calendar',
          description: 'Default calendar',
          color: '#3174ad',
          isDefault: true,
          isShared: false
        });
        console.log(`✓ Created default calendar for user ${user.email}`);

        // Assign all existing events without a calendarId to the default calendar
        await Event.update(
          { calendarId: defaultCalendar.id },
          { where: { userId: user.id, calendarId: null } }
        );
      }
    }

    // Create Rain's calendar
    const primaryUser = users[0]; // Assumes the first user is you

    // Delete old "Girlfriend's Schedule" calendar if it exists (from old naming)
    const oldGirlfriendCalendar = await Calendar.findOne({
      where: {
        ownerId: primaryUser.id,
        name: 'Girlfriend\'s Schedule'
      }
    });

    if (oldGirlfriendCalendar) {
      console.log('Deleting old "Girlfriend\'s Schedule" calendar...');
      await Event.destroy({ where: { calendarId: oldGirlfriendCalendar.id } });
      await oldGirlfriendCalendar.destroy();
    }

    // Check if Rain's calendar already exists
    let existingRainCalendar = await Calendar.findOne({
      where: {
        ownerId: primaryUser.id,
        name: 'Rain\'s Schedule'
      }
    });

    // Delete existing calendar and events if it exists (to update schedule)
    if (existingRainCalendar) {
      console.log('Deleting existing Rain\'s calendar to recreate with updated dates...');
      await Event.destroy({ where: { calendarId: existingRainCalendar.id } });
      await existingRainCalendar.destroy();
      existingRainCalendar = null;
    }

    if (!existingRainCalendar) {
      const rainCalendar = await Calendar.create({
        ownerId: primaryUser.id,
        name: 'Rain\'s Schedule',
        description: 'St Clair Nursing Semester Schedule',
        color: '#e91e63',
        isDefault: false,
        isShared: false
      });
      console.log(`✓ Created Rain's calendar`);

      // Seed Rain's semester schedule
      // Monday: 10-12 PNR 217, 3-5 PNR 220
      // Tuesday: 8-10 PNR 218, 2-5 SSC 109G
      // Wednesday: 11-12 PNR 218, 12-1 PNR 225, 3-5 PNR 221

      const startDate = new Date();
      // Start from this week's Monday
      // January 13, 2026 is Tuesday, so this Monday is January 12
      const currentDay = startDate.getDay();
      const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday is 0, Monday is 1
      const thisMonday = new Date(startDate);
      thisMonday.setDate(startDate.getDate() - daysSinceMonday);
      thisMonday.setHours(0, 0, 0, 0);

      console.log(`✓ Starting schedule from week of: ${thisMonday.toDateString()}`);

      // Helper function to create recurring events for a semester (16 weeks)
      const createRecurringEvent = async (dayOfWeek, startHour, startMinute, endHour, endMinute, title, description) => {
        for (let week = 0; week < 16; week++) {
          const eventDate = new Date(thisMonday);
          eventDate.setDate(thisMonday.getDate() + (week * 7) + dayOfWeek);

          const startTime = new Date(eventDate);
          startTime.setHours(startHour, startMinute, 0, 0);

          const endTime = new Date(eventDate);
          endTime.setHours(endHour, endMinute, 0, 0);

          await Event.create({
            userId: primaryUser.id,
            calendarId: rainCalendar.id,
            title,
            description,
            startTime,
            endTime,
            reminderTime: 30,
            color: '#e91e63',
            isImportant: false
          });
        }
      };

      // Monday (dayOfWeek = 0)
      // Adding 5 hours to compensate for UTC-5 timezone (EST/CDT)
      await createRecurringEvent(0, 15, 0, 17, 0, 'PNR 217', 'Nursing course PNR 217'); // 10 AM - 12 PM local
      await createRecurringEvent(0, 20, 0, 22, 0, 'PNR 220', 'Nursing course PNR 220'); // 3 PM - 5 PM local

      // Tuesday (dayOfWeek = 1)
      await createRecurringEvent(1, 13, 0, 15, 0, 'PNR 218', 'Nursing course PNR 218'); // 8 AM - 10 AM local
      await createRecurringEvent(1, 19, 0, 22, 0, 'SSC 109G', 'Nursing course SSC 109G'); // 2 PM - 5 PM local

      // Wednesday (dayOfWeek = 2)
      await createRecurringEvent(2, 16, 0, 17, 0, 'PNR 218', 'Nursing course PNR 218'); // 11 AM - 12 PM local
      await createRecurringEvent(2, 17, 0, 18, 0, 'PNR 225', 'Nursing course PNR 225'); // 12 PM - 1 PM local
      await createRecurringEvent(2, 20, 0, 22, 0, 'PNR 221', 'Nursing course PNR 221'); // 3 PM - 5 PM local

      // Log specific dates for verification
      const tuesday = new Date(thisMonday);
      tuesday.setDate(thisMonday.getDate() + 1);
      const wednesday = new Date(thisMonday);
      wednesday.setDate(thisMonday.getDate() + 2);

      console.log(`✓ Created Rain's semester schedule (16 weeks of recurring events)`);
      console.log(`  - Tuesday classes start: ${tuesday.toDateString()}`);
      console.log(`  - Wednesday classes start: ${wednesday.toDateString()}`);
    }

    console.log('✓ Calendar seeding completed');
  } catch (error) {
    console.error('Error seeding calendars:', error);
    throw error;
  }
};

if (require.main === module) {
  const { sequelize } = require('../config/database');

  sequelize.authenticate()
    .then(() => seedCalendars())
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

module.exports = seedCalendars;
