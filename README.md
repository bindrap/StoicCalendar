# Stoic Calendar

A full-stack calendar application that helps you track events across all devices while providing daily stoic quotes for mindfulness and calm.

## Features

- **Event Management**: Create, edit, delete, and move events with ease
- **Recurring Events**: Set up repeating events (daily, weekly, monthly, yearly) for work schedules, classes, and regular commitments
- **Drag & Drop**: Move events around by dragging and dropping them on the calendar
- **Multi-Calendar Support**: Create and manage multiple calendars with different colors
- **Calendar Sharing**: Share calendars with other users for collaboration
- **Multi-Device Sync**: Access your calendar from any device via the web
- **Mobile Optimized**: Fully responsive design with smart sticky header, touch-optimized controls, and multi-select calendar filtering
- **Smart Reminders**: Get notified via email or SMS before events
- **Daily Stoic Quotes**: Start each day with wisdom from Marcus Aurelius, Seneca, and Epictetus
- **Customizable Settings**: Configure notification preferences and reminder times
- **Multiple Views**: Month, week, work week (Monday-Friday), day, and agenda views
- **Limited Hour Display**: Shows only 6 AM to 11 PM for focused scheduling
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
- React Big Calendar with drag-and-drop support
- React DnD for drag-and-drop functionality
- Moment.js for date handling
- Axios for API calls
- Responsive mobile-first design

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
│   ├── models/           # Sequelize models
│   │   ├── User.js       # User model
│   │   ├── Event.js      # Event model (with recurring support)
│   │   ├── Calendar.js   # Calendar model
│   │   ├── Quote.js      # Quote model
│   │   ├── Notification.js # Notification model
│   │   └── ContactInfo.js # Contact info model
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── events.js     # Event routes (including recurring)
│   │   ├── calendars.js  # Calendar management routes
│   │   ├── quotes.js     # Quote routes
│   │   ├── users.js      # User preferences routes
│   │   └── contacts.js   # Contact info routes
│   ├── services/         # Business logic (email, SMS, reminders)
│   ├── middleware/       # Authentication middleware
│   ├── seeds/            # Database seed data
│   └── server.js         # Express server entry point
├── frontend/
│   ├── public/           # Static files
│   └── src/
│       ├── components/   # React components
│       │   ├── Calendar.js     # Main calendar component
│       │   ├── Calendar.css    # Calendar styling (with mobile responsive)
│       │   ├── EventModal.js   # Event create/edit modal
│       │   ├── Header.js       # Header with quote
│       │   ├── Settings.js     # User settings page
│       │   ├── Login.js        # Login page
│       │   └── Signup.js       # Signup page
│       ├── services/     # API service layer
│       │   └── api.js    # Axios API client
│       ├── App.js        # Main app component
│       ├── App.css       # App styling
│       ├── index.js      # React entry point
│       └── index.css     # Global styles
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

- `GET /api/events` - Get all events (supports date filtering and calendar filtering)
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event (supports recurring events)
- `PUT /api/events/:id` - Update single event
- `DELETE /api/events/:id` - Delete single event
- `PUT /api/events/:id/series` - Update entire recurring event series (supports time changes and bulk series)
- `POST /api/events/:id/exception` - Create exception (edit single instance of recurring event)
- `DELETE /api/events/:id/instance` - Delete single instance of recurring event
- `DELETE /api/events/:id/series` - Delete entire recurring event series (supports bulk series)

### Calendar Endpoints

- `GET /api/calendars` - Get all calendars (owned and shared)
- `GET /api/calendars/:id` - Get specific calendar
- `POST /api/calendars` - Create new calendar
- `PUT /api/calendars/:id` - Update calendar
- `DELETE /api/calendars/:id` - Delete calendar
- `POST /api/calendars/:id/share` - Share calendar with another user
- `DELETE /api/calendars/:id/share/:userId` - Unshare calendar
- `GET /api/calendars/:id/events` - Get all events for a specific calendar

### Quote Endpoints

- `GET /api/quotes/daily` - Get daily stoic quote
- `GET /api/quotes/random` - Get random quote

### User Endpoints

- `PUT /api/users/preferences` - Update notification preferences
- `PUT /api/users/profile` - Update user profile

All endpoints except `/auth/signup`, `/auth/login`, and `/quotes/*` require authentication via JWT token in the Authorization header.

## How to Use Recurring Events

Recurring events are perfect for work schedules, school timetables, regular meetings, and daily habits.

### Creating a Recurring Event

1. Click on the calendar to create a new event
2. Fill in the event details (title, description, time, etc.)
3. Check the **"🔁 Repeat"** checkbox
4. Configure the recurrence pattern:
   - **Frequency**: Choose Daily, Weekly, Monthly, or Yearly
   - **Interval**: Repeat every X days/weeks/months/years (e.g., "every 2 weeks")
   - **Days of Week** (for weekly): Select which days to repeat on (e.g., Monday-Friday for work)
   - **End Date** (optional): Set when the recurring event should stop
   - **Number of Occurrences** (optional): Limit to a specific number of repetitions
5. Click "Create" to save

**Example Use Cases:**
- **Work Schedule**: Weekly event, every 1 week, Monday-Friday, no end date
- **Gym Routine**: Weekly event, every 1 week, Monday/Wednesday/Friday
- **Monthly Meeting**: Monthly event, every 1 month, set end date or occurrence count
- **Daily Standup**: Daily event, every 1 day, weekdays only

### Editing Recurring Events

When you click on a recurring event, you have two options:

1. **"This event only"**: Creates an exception for just this instance
   - Change time, title, or any other detail
   - Original series continues unchanged
   - Useful for one-time schedule changes

2. **"All events in the series"**: Updates the entire series
   - Changes apply to all instances of the event
   - Includes time changes, title changes, description, color, and calendar assignment
   - Works for both pattern-based recurring events and bulk-created event series
   - Time shifts are applied proportionally to maintain relative scheduling
   - Useful for permanent schedule changes (e.g., changing a class time for the entire semester)

### Deleting Recurring Events

When deleting a recurring event, you'll be prompted to choose:

1. **Delete this occurrence**: Removes only the selected instance
   - Other instances remain on the calendar
   - Useful for canceling a single meeting

2. **Delete all events in this series**: Removes the entire series
   - All future occurrences are deleted
   - Use when the recurring event is no longer needed

### Drag & Drop with Recurring Events

- When you drag and drop a recurring event instance to a new time, it automatically creates an exception
- Only that specific instance is moved
- The rest of the series remains on the original schedule
- This is perfect for rescheduling a single occurrence without affecting the pattern

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
- **Create Events**: Click on any day/time slot to create a new event
- **Drag & Drop**: Drag events to reschedule them instantly
- **Resize Events**: Drag the edges of events to adjust their duration
- **Edit Events**: Click on any event to edit its details
- **Delete Events**: Remove single events or entire recurring series
- **Color Coding**: Assign custom colors to events for easy identification
- **Multiple Views**: Switch between month, week, work week (Monday-Friday), day, and agenda views

### Recurring Events
- **Flexible Patterns**: Create daily, weekly, monthly, or yearly recurring events
- **Custom Intervals**: Repeat every X days/weeks/months/years
- **Day Selection**: For weekly events, choose which days of the week to repeat on
- **End Options**: Set an end date or specify a number of occurrences
- **Edit Options**: When editing recurring events, choose to:
  - Edit only the selected instance
  - Edit all events in the series (including time changes)
- **Bulk Series Support**: Automatically detects event series with matching titles (e.g., "PNR 218") and allows bulk editing
- **Smart Time Shifts**: When changing time for a series, the shift is applied proportionally to all instances
- **Delete Options**: Delete a single occurrence or the entire series
- **Drag & Drop**: Moving a recurring event instance automatically creates an exception
- **Perfect for**: Work schedules, school timetables, regular meetings, and habits

### Multi-Calendar Support
- **Multiple Calendars**: Create separate calendars for work, personal, family, etc.
- **Color Coding**: Each calendar has its own color for easy visual distinction
- **Calendar Filtering**: Toggle calendars on/off to show/hide events
- **Calendar Sharing**: Share calendars with other users by email
- **Shared Calendar Access**: View and edit events on calendars shared with you
- **Mobile Selector**: On mobile, easily switch between calendars with a dropdown

### Mobile Experience
- **Optimized Layout**: Calendar takes up the entire screen with minimal padding for maximum viewing area
- **Smart Sticky Header**: Header automatically shrinks when scrolling down to save screen space
  - Quote, title, and navigation buttons compress smoothly
  - Returns to full size when scrolling back up
- **Touch Optimized**: All interactions are touch-friendly with 44px+ button sizes
- **Responsive Views**: Automatically defaults to week and day views on mobile for better usability
- **Limited Hour Range**: Calendar displays only 6 AM to 11 PM to focus on active hours
- **Multi-Select Calendar Dropdown**: Choose which calendars to display
  - Checkbox interface for selecting multiple calendars
  - "All" and "None" quick action buttons
  - Visual indicators show selected calendars with highlighted borders
  - Grouped by "My Calendars" and "Shared With Me"
  - Large touch targets for easy interaction
- **Smooth Scrolling**: Enhanced touch scrolling with momentum for natural feel
- **Visual Feedback**: Active states on all buttons and events for responsive feel

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
