const twilio = require('twilio');

class SMSService {
  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    } else {
      console.warn('Twilio credentials not configured. SMS service disabled.');
    }
  }

  async sendEventReminder(phone, event) {
    if (!this.client) {
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const message = await this.client.messages.create({
        body: `Reminder: ${event.title} starts at ${new Date(event.startTime).toLocaleString()}. ${event.description || ''}`,
        from: this.fromNumber,
        to: phone
      });

      console.log('SMS sent:', message.sid);
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('SMS sending error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendDailyQuote(phone, quote) {
    if (!this.client) {
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const message = await this.client.messages.create({
        body: `Daily Stoic Quote:\n"${quote.text}"\n— ${quote.author}`,
        from: this.fromNumber,
        to: phone
      });

      console.log('Daily quote SMS sent:', message.sid);
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('SMS sending error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();
