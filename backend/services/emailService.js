const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEventReminder(email, event) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Reminder: ${event.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Event Reminder</h2>
            <p><strong>${event.title}</strong></p>
            <p>${event.description || ''}</p>
            <p><strong>When:</strong> ${new Date(event.startTime).toLocaleString()}</p>
            <p>This is a reminder that your event is coming up in ${event.reminderTime} minutes.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">Sent from Stoic Calendar</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendDailyQuote(email, quote) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Daily Stoic Quote',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2>Daily Stoic Wisdom</h2>
            <blockquote style="font-size: 18px; font-style: italic; color: #333; border-left: 4px solid #3174ad; padding-left: 20px; margin: 20px 0;">
              "${quote.text}"
            </blockquote>
            <p style="text-align: right; color: #666;">— ${quote.author}</p>
            <hr>
            <p style="font-size: 12px; color: #666;">Sent from Stoic Calendar</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Daily quote email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
