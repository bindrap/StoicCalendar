# Week Start Day Fix

## Changes Made

Updated `/home/opc/StoicCalendar/frontend/src/components/Calendar.js` to ensure weeks start on Monday:

1. **Moment Configuration**: Set `dow: 1` to make Monday the first day of week
2. **Added Console Logging**: Verify configuration is working
3. **Removed unused imports**: Cleaned up Views import that wasn't needed

## How to Verify

1. Rebuild the containers:
   ```bash
   docker-compose up --build
   ```

2. Open browser console (F12) and check for log message:
   ```
   Moment first day of week: 1
   ```
   - If it shows `1`, Monday is correctly set as first day
   - If it shows `0`, something is wrong with the configuration

3. Check the calendar views:
   - **Month view**: Should show Mon-Sun columns (starting with Monday)
   - **Week view**: Should show Monday as the first column
   - **Work Week view**: Should show Monday-Friday only

## Important Notes

- If you previously created a recurring event with specific days (e.g., Tuesday-Saturday), those events will still show on those days because they were saved with those day selections
- The fix ensures NEW events and calendar views use Monday as the first day
- To fix existing recurring events, you need to edit them and choose "All events in the series" to update the days

## Moment.js Day Numbers

- 0 = Sunday
- 1 = Monday (our setting)
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday
