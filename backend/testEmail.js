require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing email configuration...\n');

  console.log('Configuration:');
  console.log(`  Host: ${process.env.EMAIL_HOST}`);
  console.log(`  Port: ${process.env.EMAIL_PORT}`);
  console.log(`  User: ${process.env.EMAIL_USER}`);
  console.log(`  Password: ${process.env.EMAIL_PASSWORD ? '***SET***' : '***NOT SET***'}`);
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials not configured!');
    console.log('\nTo fix this:');
    console.log('1. Go to https://myaccount.google.com/apppasswords');
    console.log('2. Create an App Password for "Stoic Calendar"');
    console.log('3. Update backend/.env with:');
    console.log(`   EMAIL_PASSWORD=your_16_char_app_password`);
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✓ Connection verified!\n');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email from Stoic Calendar',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🎉 Email Configuration Successful!</h2>
          <p>Your Stoic Calendar is now configured to send email notifications.</p>
          <blockquote style="font-style: italic; border-left: 4px solid #3174ad; padding-left: 20px; color: #666;">
            "You have power over your mind - not outside events. Realize this, and you will find strength."
            <br>— Marcus Aurelius
          </blockquote>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            Sent from Stoic Calendar
          </p>
        </div>
      `
    });

    console.log('✓ Test email sent successfully!');
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`\n📧 Check your inbox at ${process.env.EMAIL_USER}`);
    console.log('\n✅ Gmail setup complete! Email notifications will now work.');
  } catch (error) {
    console.error('❌ Email test failed!');
    console.error('Error:', error.message);

    if (error.message.includes('Invalid login')) {
      console.log('\n💡 This usually means:');
      console.log('  1. You need to use an App Password (not your regular password)');
      console.log('  2. Go to https://myaccount.google.com/apppasswords');
      console.log('  3. Enable 2-Step Verification first if needed');
      console.log('  4. Generate an App Password for "Stoic Calendar"');
      console.log('  5. Update EMAIL_PASSWORD in backend/.env');
    }

    process.exit(1);
  }
}

testEmail();
