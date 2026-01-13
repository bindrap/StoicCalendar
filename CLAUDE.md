# Stoic Calendar

## Project Overview
A cross-device accessible calendar website that helps track events and provides stoic quotes for mindfulness and calm.

### Core Features
- Event management (add, edit, delete, move events)
- Multi-device synchronization
- Event reminders (web, email, SMS)
- Daily stoic quotes
- Docker deployment

---

## Requirements

### Calendar Features
- Easy to add events
- Easy to move or delete/update events
- Reminder on upcoming events
- Display on website with email/SMS notification options

### Stoic Quotes
- Display at top of website
- Optional email or SMS delivery
- Daily rotation

### Technical Requirements
- Accessible via URL from any device
- Docker containerization
- Real-time synchronization across devices

---

## Implementation Plan

### Phase 1: Foundation & Setup
**Goal:** Set up development environment and basic infrastructure

1. **Project Structure**
   - Initialize Node.js/Python project
   - Set up version control (Git)
   - Create Docker configuration files
   - Define folder structure (frontend, backend, database)

2. **Technology Stack Decisions**
   - **Frontend:** React/Vue.js or simple HTML/CSS/JavaScript
   - **Backend:** Node.js (Express) or Python (Flask/FastAPI)
   - **Database:** PostgreSQL or MongoDB
   - **Authentication:** JWT or session-based
   - **Notifications:** Twilio (SMS), SendGrid/Nodemailer (Email)
   - **Containerization:** Docker & Docker Compose

3. **Database Schema Design**
   - Users table (id, email, phone, preferences)
   - Events table (id, user_id, title, description, start_time, end_time, reminder_time)
   - Quotes table (id, quote_text, author, date_used)
   - Notifications table (id, user_id, event_id, type, sent_at, status)

### Phase 2: Backend Development
**Goal:** Build API and core business logic

4. **User Authentication**
   - Sign up / Login endpoints
   - Password hashing and security
   - Session/token management
   - Protected routes middleware

5. **Calendar API Endpoints**
   - `POST /events` - Create event
   - `GET /events` - List all events (with date filtering)
   - `GET /events/:id` - Get specific event
   - `PUT /events/:id` - Update event
   - `DELETE /events/:id` - Delete event

6. **Reminder System**
   - Background job scheduler (node-cron, celery, etc.)
   - Check for upcoming events
   - Trigger notifications based on reminder_time
   - Email notification integration
   - SMS notification integration

7. **Stoic Quotes API**
   - `GET /quote/daily` - Get daily quote
   - Seed database with stoic quotes
   - Quote rotation logic
   - Optional: External API integration (Stoic Quotes API)

### Phase 3: Frontend Development
**Goal:** Create user interface

8. **Layout & Navigation**
   - Responsive design (mobile, tablet, desktop)
   - Header with stoic quote display
   - Navigation menu
   - Login/signup pages

9. **Calendar Interface**
   - Month/week/day views
   - Interactive event creation (click to add)
   - Drag-and-drop to move events
   - Event detail modal
   - Edit/delete functionality

10. **User Settings Page**
    - Notification preferences (email/SMS toggle)
    - Reminder timing preferences
    - Account information
    - Quote delivery preferences

11. **Real-time Updates**
    - WebSocket connection or polling
    - Sync events across devices
    - Live notification badges

### Phase 4: Docker & Deployment
**Goal:** Containerize and deploy application

12. **Dockerization**
    - Create Dockerfile for backend
    - Create Dockerfile for frontend
    - Set up docker-compose.yml
    - Configure environment variables
    - Set up volumes for data persistence

13. **Container Services**
    - Web application container
    - Database container
    - Background worker container (for reminders)
    - Nginx/reverse proxy (optional)

14. **Deployment**
    - Choose hosting (AWS, DigitalOcean, Heroku, Railway)
    - Set up domain and SSL certificate
    - Configure production environment variables
    - Set up database backups
    - Deploy containers

### Phase 5: Testing & Refinement
**Goal:** Ensure reliability and user experience

15. **Testing**
    - Unit tests for API endpoints
    - Integration tests for reminder system
    - Frontend component testing
    - End-to-end testing
    - Cross-device testing

16. **Performance Optimization**
    - Database query optimization
    - Caching strategy
    - Frontend bundle optimization
    - API response time monitoring

17. **User Experience Improvements**
    - Loading states and spinners
    - Error handling and user feedback
    - Accessibility improvements
    - Mobile responsiveness polish

### Phase 6: Advanced Features (Optional)
**Goal:** Enhance functionality

18. **Additional Features**
    - Recurring events support
    - Event categories/tags
    - Color coding for events
    - Calendar import/export (iCal format)
    - Sharing events with others
    - Multiple calendar views
    - Search and filter functionality
    - Time zone support

---

## Development Guidelines

### Security Considerations
- Sanitize all user inputs
- Use HTTPS in production
- Implement rate limiting
- Secure API keys and credentials
- Regular security updates

### Best Practices
- Write clean, documented code
- Use environment variables for configuration
- Implement proper error handling
- Log important events and errors
- Follow RESTful API conventions

### Monitoring & Maintenance
- Set up logging system
- Monitor notification delivery rates
- Track user engagement
- Regular database backups
- Update dependencies regularly

---

## Quick Start Commands

```bash
# Development
docker-compose up --build

# Run tests
npm test  # or pytest

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## Success Metrics
- Events successfully sync across devices
- Reminders delivered on time (95%+ success rate)
- Daily quote displayed/delivered
- Application accessible 24/7
- Fast load times (<2 seconds) 
