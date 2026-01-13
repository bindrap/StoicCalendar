#!/bin/bash

echo "================================================"
echo "  Stoic Calendar - Gmail Setup Wizard"
echo "================================================"
echo ""

# Check if .env files exist
if [ ! -f ".env" ]; then
    echo "Creating root .env file..."
    cp .env.example .env 2>/dev/null || touch .env
fi

if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from example..."
    cp backend/.env.example backend/.env
fi

echo "📧 Gmail Setup for Stoic Calendar"
echo "================================"
echo ""
echo "Your email is already configured as: pbindra97@gmail.com"
echo ""
echo "⚠️  IMPORTANT: Do NOT use your regular Gmail password!"
echo "   Gmail requires an App Password for security."
echo ""
echo "📋 Follow these steps:"
echo ""
echo "1. Enable 2-Factor Authentication:"
echo "   → https://myaccount.google.com/security"
echo ""
echo "2. Generate App Password:"
echo "   → Go to: https://myaccount.google.com/apppasswords"
echo "   → Select: Mail → Other (Custom name)"
echo "   → Name it: 'Stoic Calendar'"
echo "   → Copy the 16-character password"
echo ""
echo "3. Update your .env files with the App Password:"
echo "   - Edit: /mnt/c/Users/bindrap/Documents/StoicCalendar/.env"
echo "   - Edit: /mnt/c/Users/bindrap/Documents/StoicCalendar/backend/.env"
echo "   - Set: EMAIL_PASSWORD=your_app_password"
echo ""
echo "4. Test the setup:"
echo "   cd backend && node testEmail.js"
echo ""
echo "5. Start the app:"
echo "   docker-compose up --build"
echo ""
echo "📖 Full guide: See GMAIL_SETUP.md for detailed instructions"
