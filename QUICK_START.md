# Quick Start Guide - Stoic Calendar

Get your Stoic Calendar up and running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Gmail account (for email notifications)

## 1. Get Gmail App Password (2 minutes)

**Why?** Gmail requires an App Password for security (not your regular password).

### Quick Steps:
1. **Enable 2FA**: https://myaccount.google.com/security
2. **Generate App Password**: https://myaccount.google.com/apppasswords
   - Select: Mail → Other → "Stoic Calendar"
   - Copy the 16-character password (example: `abcd efgh ijkl mnop`)

### Full instructions:
See `GMAIL_SETUP.md` for detailed screenshots and troubleshooting.

## 2. Configure Email Settings (30 seconds)

Edit **TWO** files and add your App Password:

### File 1: `.env` (root directory)
```bash
cd /mnt/c/Users/bindrap/Documents/StoicCalendar
nano .env
```

Update this line:
```env
EMAIL_PASSWORD=abcdefghijklmnop
```
(Remove spaces from the App Password)

### File 2: `backend/.env`
```bash
nano backend/.env
```

Update the same line:
```env
EMAIL_PASSWORD=abcdefghijklmnop
```

**Save both files!**

## 3. Test Email Setup (30 seconds)

```bash
cd backend
npm install
npm run test-email
```

✅ If successful, you'll get a test email at pbindra97@gmail.com!

## 4. Start the App (1 minute)

```bash
cd ..
docker-compose up --build
```

Wait for:
```
✓ Database synchronized
✓ Successfully seeded 30 stoic quotes
✓ Server running on port 5000
```

## 5. Use the App!

Open your browser: **http://localhost:3000**

### First Time Setup:
1. Click **"Sign Up"**
2. Enter your email: `pbindra97@gmail.com`
3. Create a password
4. Click **"Sign Up"**

### Add Your Contact Info:
1. Go to **Settings**
2. Click **"+ Add Contact"**
3. Add email: `pbindra97@gmail.com`
4. Add phone: `+12262469109`
5. Toggle notifications ON for both

### Create Your First Event:
1. Go to **Calendar**
2. Click any date
3. Add event details
4. Set reminder time (e.g., 15 minutes before)
5. Click **"Create"**

### Configure Notifications:
1. Go to **Settings**
2. Enable **"Email notifications"**
3. Enable **"Daily stoic quote"**
4. Choose quote delivery: **"Email"**
5. Click **"Save Preferences"**

## Features You Can Use Now

✅ **Calendar**
- Create, edit, delete events
- Multiple views (month, week, day, agenda)
- Color-code events
- Drag to move events (coming soon)

✅ **Multiple Contacts**
- Add multiple emails
- Add multiple phone numbers
- Label them (Work, Personal, etc.)
- Toggle notifications per contact
- Set primary contacts

✅ **Notifications**
- Email reminders before events
- Daily stoic quotes at 7 AM
- Sent to ALL enabled contacts

✅ **Daily Wisdom**
- 30+ authentic stoic quotes
- Displayed at top of every page
- Optional email/SMS delivery
- New quote each day

## Common Commands

```bash
# Start the app
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop the app
docker-compose down

# Test email setup
cd backend && npm run test-email

# Restart backend only
docker-compose restart backend
```

## Troubleshooting

### Email not sending?
```bash
# Check backend logs
docker-compose logs backend

# Test email configuration
cd backend && npm run test-email
```

### Can't log in?
- Clear browser cache
- Try incognito mode
- Check console for errors (F12)

### Database issues?
```bash
# Reset database
docker-compose down -v
docker-compose up --build
```

### Port already in use?
Edit `docker-compose.yml` and change ports:
```yaml
ports:
  - "3001:80"    # Frontend (change 3000 to 3001)
  - "5001:5000"  # Backend (change 5000 to 5001)
```

## What About Twilio (SMS)?

**You don't need it!** Twilio is only for SMS notifications.

- Email works without Twilio
- Add SMS later if you want
- See `GMAIL_SETUP.md` for Twilio setup

## Next Steps

- Read `README.md` for full documentation
- Read `UPDATED_FEATURES.md` for new features
- Explore the settings page
- Add more events
- Invite family/friends to use it

## Support

- **Backend logs**: `docker-compose logs backend`
- **Frontend logs**: Browser console (F12)
- **Database issues**: See README.md troubleshooting section

---

**Enjoy your Stoic Calendar!**

*"You have power over your mind - not outside events. Realize this, and you will find strength." — Marcus Aurelius*
