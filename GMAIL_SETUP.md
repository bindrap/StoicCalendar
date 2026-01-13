# Gmail Setup Guide for Stoic Calendar

## Important: Don't Use Your Regular Gmail Password!

For security, Gmail requires you to use an **App Password** instead of your regular password when connecting from applications.

## Step-by-Step Setup

### Step 1: Enable 2-Factor Authentication (if not already enabled)

1. Go to: https://myaccount.google.com/security
2. Look for "2-Step Verification"
3. If it's OFF, click to enable it
4. Follow the prompts to set it up with your phone

### Step 2: Generate an App Password

1. Go to: https://myaccount.google.com/apppasswords
   - If the link doesn't work, go to Google Account → Security → 2-Step Verification → App passwords

2. You might need to sign in again

3. At the bottom, you'll see "App passwords"

4. Click **"Select app"** → Choose **"Mail"**

5. Click **"Select device"** → Choose **"Other (Custom name)"**

6. Type: **"Stoic Calendar"**

7. Click **"Generate"**

8. Google will show you a 16-character password like: `abcd efgh ijkl mnop`

9. **Copy this password** (you won't be able to see it again!)

### Step 3: Update Configuration Files

You need to update **TWO** .env files:

#### File 1: `/mnt/c/Users/bindrap/Documents/StoicCalendar/.env`

```env
EMAIL_PASSWORD=abcdefghijklmnop
```
(Remove the spaces from the App Password)

#### File 2: `/mnt/c/Users/bindrap/Documents/StoicCalendar/backend/.env`

```env
EMAIL_PASSWORD=abcdefghijklmnop
```

### Step 4: Test Your Setup

Run this test script to verify everything works:

```bash
cd /mnt/c/Users/bindrap/Documents/StoicCalendar/backend
node testEmail.js
```

If successful, you'll receive a test email at pbindra97@gmail.com!

### Step 5: Start Your App

Now restart your Docker containers:

```bash
cd /mnt/c/Users/bindrap/Documents/StoicCalendar
docker-compose down
docker-compose up --build
```

## Troubleshooting

### "Invalid login" error
- Make sure you're using the App Password, not your regular password
- Remove any spaces from the App Password
- Verify 2-Step Verification is enabled

### Can't find App Passwords option
- Make sure 2-Step Verification is enabled first
- Try this direct link: https://security.google.com/settings/security/apppasswords

### Email not sending
- Check the backend logs: `docker-compose logs backend`
- Verify EMAIL_USER and EMAIL_PASSWORD are set in both .env files
- Try the test script: `node backend/testEmail.js`

## About Twilio (Optional - SMS Only)

**You don't need Twilio for email!** Twilio is only required if you want SMS notifications.

### If you want SMS:
1. Sign up at https://www.twilio.com/try-twilio (free trial available)
2. Get a phone number
3. Copy your Account SID and Auth Token
4. Update the Twilio variables in your .env files

### If you don't want SMS:
- Leave the Twilio fields blank
- Email notifications will still work perfectly
- You can add SMS later if you want

## Security Notes

✅ **App Passwords are safe** - They only work for this specific app
✅ **You can revoke them anytime** at https://myaccount.google.com/apppasswords
✅ **They don't give access to your account** - Just email sending
❌ **Never share your App Password** publicly or in screenshots

---

Once set up, you'll receive:
- Email reminders before events
- Daily stoic quotes (if enabled)
- All notifications to your configured email addresses

**Questions?** Check the logs with `docker-compose logs backend`
