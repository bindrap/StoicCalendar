# Setup Guide for Stoic Calendar

This guide will help you get the Stoic Calendar application up and running on your machine.

## Quick Start (Recommended)

The easiest way to run the application is using Docker:

```bash
# 1. Navigate to the project directory
cd /mnt/c/Users/bindrap/Documents/StoicCalendar

# 2. Start all services with Docker Compose
docker-compose up --build
```

That's it! The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Step-by-Step Setup

### Step 1: Environment Configuration

The project includes `.env` files that are pre-configured for development. If you want to customize:

```bash
# Root level (for Docker Compose)
cp .env.example .env

# Backend
cd backend
cp .env.example .env

# Frontend
cd ../frontend
cp .env.example .env
```

### Step 2: Configure Optional Services

#### Email Notifications (Optional)

To enable email reminders, edit `backend/.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**For Gmail users:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate a new app password
3. Use that password in `EMAIL_PASSWORD`

#### SMS Notifications (Optional)

To enable SMS reminders:

1. Sign up at https://www.twilio.com/try-twilio
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Edit `backend/.env`:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Start the Application

#### Using Docker (Recommended)

```bash
# Start in foreground (see logs)
docker-compose up --build

# Or start in background (detached mode)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

#### Without Docker (Manual Setup)

**Terminal 1 - Database:**
```bash
# Install and start PostgreSQL
# Create database: stoic_calendar
createdb stoic_calendar
```

**Terminal 2 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
npm start
```

## First Time Usage

1. **Open your browser** to http://localhost:3000

2. **Sign up for an account:**
   - Click "Sign up"
   - Enter your email and password
   - (Optional) Add your phone number for SMS notifications

3. **Create your first event:**
   - Click on any date in the calendar
   - Fill in the event details
   - Set a reminder time
   - Click "Create"

4. **Configure settings:**
   - Click "Settings" in the navigation
   - Enable email/SMS notifications
   - Set your default reminder time
   - Choose how you want to receive daily quotes

5. **Enjoy your daily stoic quote!**
   - A new quote appears at the top of the page each day
   - Quotes rotate automatically from a collection of 30+ stoic wisdom

## Troubleshooting

### Port Already in Use

If ports 3000 or 5000 are already in use, you can change them:

Edit `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "5001:5000"  # Change 5000 to 5001
  frontend:
    ports:
      - "3001:80"    # Change 3000 to 3001
```

### Database Connection Failed

Check if PostgreSQL container is running:
```bash
docker ps
docker logs stoic-calendar-db
```

Restart the database:
```bash
docker-compose restart postgres
```

### Can't See Changes in Development

If you're developing and changes aren't showing:

**Backend:** Restart the backend service
```bash
docker-compose restart backend
```

**Frontend:** Clear browser cache or open in incognito mode

### Email/SMS Not Sending

This is normal if you haven't configured email/SMS credentials. The app works fine without them - you just won't receive external notifications.

To check if credentials are configured:
```bash
# View backend logs
docker-compose logs backend

# Look for messages like:
# "Email sent: <message-id>"
# or
# "SMS sent: <message-id>"
```

## Testing the Application

Run backend tests:
```bash
cd backend
npm test
```

## Stopping the Application

```bash
# Stop all containers
docker-compose down

# Stop and remove all data (including database)
docker-compose down -v
```

## Next Steps

- Check out `CLAUDE.md` for the full project plan
- Read `README.md` for detailed documentation
- Explore the API endpoints at http://localhost:5000/api/health

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables are set correctly
3. Make sure Docker is running and up to date
4. Try rebuilding: `docker-compose up --build --force-recreate`

---

**Happy organizing, and may stoic wisdom guide your day!**
