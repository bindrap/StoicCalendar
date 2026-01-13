# Stoic Calendar

A full-stack calendar application that helps you track events across all devices while providing daily stoic quotes for mindfulness and calm.

## Features

- **Event Management**: Create, edit, delete, and move events with ease
- **Multi-Device Sync**: Access your calendar from any device via the web
- **Smart Reminders**: Get notified via email or SMS before events
- **Daily Stoic Quotes**: Start each day with wisdom from Marcus Aurelius, Seneca, and Epictetus
- **Customizable Settings**: Configure notification preferences and reminder times
- **Docker Support**: Easy deployment with Docker and Docker Compose

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database
- Sequelize ORM
- JWT authentication
- Node-cron for scheduled tasks
- Nodemailer for email notifications
- Twilio for SMS notifications

### Frontend
- React 18
- React Router for navigation
- React Big Calendar for calendar interface
- Axios for API calls
- Responsive design for all devices

### Infrastructure
- Docker & Docker Compose
- Nginx for frontend serving and reverse proxy
- PostgreSQL for data persistence

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- (Optional) Email account for notifications (Gmail recommended)
- (Optional) Twilio account for SMS notifications

### Quick Start

1. **Clone the repository**
   ```bash
   cd /path/to/StoicCalendar
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DB_PASSWORD`: Your PostgreSQL password
   - `JWT_SECRET`: A secure random string for JWT signing
   - `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`: Your email SMTP settings
   - (Optional) Twilio credentials for SMS

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

   The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

4. **Create an account**
   - Navigate to http://localhost:3000
   - Click "Sign up" and create your account
   - Start adding events and enjoying daily stoic quotes!

## Development Setup

### Backend Development

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend API URL
npm start
```

## Project Structure

```
StoicCalendar/
├── backend/
│   ├── config/           # Database configuration
│   ├── models/           # Sequelize models (User, Event, Quote, Notification)
│   ├── routes/           # API routes
│   ├── services/         # Business logic (email, SMS, reminders)
│   ├── middleware/       # Authentication middleware
│   ├── seeds/            # Database seed data
│   └── server.js         # Express server entry point
├── frontend/
│   ├── public/           # Static files
│   └── src/
│       ├── components/   # React components
│       ├── services/     # API service layer
│       ├── App.js        # Main app component
│       └── index.js      # React entry point
├── docker-compose.yml    # Docker orchestration
├── CLAUDE.md             # Project requirements and plan
└── README.md             # This file
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to existing account
- `GET /api/auth/me` - Get current user info

### Event Endpoints

- `GET /api/events` - Get all events (supports date filtering)
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Quote Endpoints

- `GET /api/quotes/daily` - Get daily stoic quote
- `GET /api/quotes/random` - Get random quote

### User Endpoints

- `PUT /api/users/preferences` - Update notification preferences
- `PUT /api/users/profile` - Update user profile

All endpoints except `/auth/signup`, `/auth/login`, and `/quotes/*` require authentication via JWT token in the Authorization header.

## Configuration

### Email Notifications

To enable email notifications, configure these environment variables:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password in `EMAIL_PASSWORD`

### SMS Notifications

To enable SMS notifications, sign up for [Twilio](https://www.twilio.com) and configure:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Features in Detail

### Event Management
- Click on any day to create a new event
- Drag and drop events to reschedule (coming soon)
- Set custom reminder times for each event
- Color-code events for easy identification
- View events in month, week, day, or agenda view

### Notification System
- Background job runs every minute to check for upcoming events
- Sends reminders based on user preferences and event settings
- Supports email and SMS delivery methods
- Tracks notification status (pending, sent, failed)

### Stoic Quotes
- Database seeded with 30+ authentic stoic quotes
- Automatic daily rotation ensures fresh inspiration
- Quote displayed prominently at top of every page
- Optional email/SMS delivery each morning at 7 AM

### User Settings
- Toggle email/SMS notifications on or off
- Set default reminder time (in minutes before event)
- Configure daily quote delivery method
- Update profile information (email, phone)

## Deployment

### Production Deployment

For production, create a `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    environment:
      NODE_ENV: production
      # Use secure secrets from environment
```

Then deploy:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Recommended Hosting Platforms
- **DigitalOcean**: App Platform or Droplet with Docker
- **AWS**: ECS or EC2 with Docker
- **Railway**: Direct Docker deployment
- **Heroku**: Container Registry

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL container is running: `docker ps`
- Check database logs: `docker logs stoic-calendar-db`
- Verify environment variables are set correctly

### Email not sending
- Verify SMTP credentials are correct
- Check email service allows less secure apps or has app passwords enabled
- Review backend logs for detailed error messages

### Frontend can't reach backend
- Ensure both containers are running
- Check nginx configuration in `frontend/nginx.conf`
- Verify CORS settings in backend allow frontend origin

## Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests with improvements
- Share your own stoic quotes to add to the collection

## License

MIT License - Feel free to use this project for personal or educational purposes.

## Acknowledgments

- Stoic quotes sourced from the writings of Marcus Aurelius, Seneca, and Epictetus
- Calendar interface powered by [React Big Calendar](https://github.com/jquense/react-big-calendar)
- Inspiration from stoic philosophy and the need for mindful productivity

---

*"You have power over your mind - not outside events. Realize this, and you will find strength." - Marcus Aurelius*
