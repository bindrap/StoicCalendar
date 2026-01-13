const cron = require('node-cron');
const { Event, User, Notification, Quote, ContactInfo } = require('../models');
const { Op } = require('sequelize');
const emailService = require('./emailService');
const smsService = require('./smsService');

class ReminderService {
  start() {
    console.log('Starting reminder service...');

    cron.schedule('* * * * *', async () => {
      await this.checkUpcomingEvents();
    });

    cron.schedule('0 7 * * *', async () => {
      await this.sendDailyQuotes();
    });

    console.log('✓ Reminder service started');
  }

  async checkUpcomingEvents() {
    try {
      const now = new Date();
      const futureTime = new Date(now.getTime() + 60 * 60 * 1000);

      const upcomingEvents = await Event.findAll({
        where: {
          startTime: {
            [Op.between]: [now, futureTime]
          }
        },
        include: [{ model: User }]
      });

      for (const event of upcomingEvents) {
        const reminderTimeMs = event.reminderTime * 60 * 1000;
        const reminderTime = new Date(event.startTime.getTime() - reminderTimeMs);

        if (now >= reminderTime && now < event.startTime) {
          const alreadySent = await Notification.findOne({
            where: {
              eventId: event.id,
              status: 'sent',
              createdAt: {
                [Op.gte]: new Date(now.getTime() - reminderTimeMs)
              }
            }
          });

          if (!alreadySent) {
            await this.sendEventReminders(event);
          }
        }
      }
    } catch (error) {
      console.error('Error checking upcoming events:', error);
    }
  }

  async sendEventReminders(event) {
    try {
      const user = event.User;
      const preferences = user.preferences;

      // Get all contacts for this user that should receive notifications
      const contacts = await ContactInfo.findAll({
        where: {
          userId: user.id,
          receiveNotifications: true
        }
      });

      // Send email notifications (for ALL events)
      if (preferences.emailNotifications) {
        const emailContacts = contacts.filter(c => c.type === 'email');

        for (const contact of emailContacts) {
          const emailResult = await emailService.sendEventReminder(contact.value, event);

          await Notification.create({
            userId: user.id,
            eventId: event.id,
            type: 'email',
            status: emailResult.success ? 'sent' : 'failed',
            sentAt: emailResult.success ? new Date() : null,
            message: `Reminder for event: ${event.title} sent to ${contact.value}`,
            error: emailResult.error || null
          });
        }
      }

      // Send SMS notifications (ONLY for important events)
      if (preferences.smsNotifications && event.isImportant) {
        const phoneContacts = contacts.filter(c => c.type === 'phone');

        for (const contact of phoneContacts) {
          const smsResult = await smsService.sendEventReminder(contact.value, event);

          await Notification.create({
            userId: user.id,
            eventId: event.id,
            type: 'sms',
            status: smsResult.success ? 'sent' : 'failed',
            sentAt: smsResult.success ? new Date() : null,
            message: `Important reminder for event: ${event.title} sent to ${contact.value}`,
            error: smsResult.error || null
          });
        }
      }

      console.log(`Reminders sent for event: ${event.title}`);
    } catch (error) {
      console.error('Error sending event reminders:', error);
    }
  }

  async sendDailyQuotes() {
    try {
      console.log('Sending daily quotes...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const quote = await Quote.findOne({
        where: {
          dateUsed: {
            [Op.gte]: today
          }
        }
      });

      if (!quote) {
        console.log('No daily quote available');
        return;
      }

      const users = await User.findAll({
        where: {
          'preferences.dailyQuote': true
        }
      });

      let sentCount = 0;

      for (const user of users) {
        const preferences = user.preferences;

        // Get contacts for this user
        const contacts = await ContactInfo.findAll({
          where: {
            userId: user.id,
            receiveNotifications: true
          }
        });

        if (preferences.quoteDelivery === 'email') {
          const emailContacts = contacts.filter(c => c.type === 'email');
          for (const contact of emailContacts) {
            await emailService.sendDailyQuote(contact.value, quote);
            sentCount++;
          }
        }

        if (preferences.quoteDelivery === 'sms') {
          const phoneContacts = contacts.filter(c => c.type === 'phone');
          for (const contact of phoneContacts) {
            await smsService.sendDailyQuote(contact.value, quote);
            sentCount++;
          }
        }
      }

      console.log(`Daily quotes sent to ${sentCount} contacts`);
    } catch (error) {
      console.error('Error sending daily quotes:', error);
    }
  }
}

module.exports = new ReminderService();
