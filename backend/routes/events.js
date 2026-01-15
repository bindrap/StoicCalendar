const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Event } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Helper function to generate recurring event instances
function generateRecurringInstances(parentEvent, startDate, endDate) {
  const instances = [];
  const pattern = parentEvent.recurringPattern;

  if (!pattern || !pattern.frequency) return instances;

  const eventStart = new Date(parentEvent.startTime);
  const eventEnd = new Date(parentEvent.endTime);
  const eventDuration = eventEnd - eventStart;

  const queryEndDate = new Date(endDate);
  const patternEndDate = pattern.endDate ? new Date(pattern.endDate) : null;
  const maxEndDate = patternEndDate && patternEndDate < queryEndDate ? patternEndDate : queryEndDate;

  let count = 0;
  const maxCount = pattern.count || 365;

  if (pattern.frequency === 'weekly') {
    // For weekly events, just add 7 days repeatedly from the original start time
    let currentDate = new Date(eventStart);

    while (currentDate <= maxEndDate && count < maxCount) {
      if (currentDate >= new Date(startDate)) {
        instances.push({
          ...parentEvent.toJSON(),
          id: `${parentEvent.id}_${currentDate.toISOString()}`,
          startTime: currentDate.toISOString(),
          endTime: new Date(currentDate.getTime() + eventDuration).toISOString(),
          recurringEventId: parentEvent.id,
          originalStartTime: currentDate.toISOString(),
          isRecurringInstance: true
        });
        count++;
      }

      // Add exactly 7 days * interval
      currentDate = new Date(currentDate.getTime() + (7 * (pattern.interval || 1) * 24 * 60 * 60 * 1000));
    }
  } else {
    // Handle other frequencies (daily, monthly, yearly) - existing logic
    let currentDate = new Date(Math.max(eventStart, new Date(startDate)));

    while (currentDate <= maxEndDate && count < maxCount) {
      let shouldInclude = false;

      if (pattern.frequency === 'daily') {
        shouldInclude = true;
        currentDate.setDate(currentDate.getDate() + (pattern.interval || 1));
      } else if (pattern.frequency === 'monthly') {
        shouldInclude = true;
        currentDate.setMonth(currentDate.getMonth() + (pattern.interval || 1));
      } else if (pattern.frequency === 'yearly') {
        shouldInclude = true;
        currentDate.setFullYear(currentDate.getFullYear() + (pattern.interval || 1));
      }

      if (shouldInclude && currentDate >= new Date(startDate) && currentDate <= maxEndDate) {
        const instanceStart = new Date(currentDate);
        const instanceEnd = new Date(currentDate.getTime() + eventDuration);

        instances.push({
          ...parentEvent.toJSON(),
          id: `${parentEvent.id}_${instanceStart.toISOString()}`,
          startTime: instanceStart.toISOString(),
          endTime: instanceEnd.toISOString(),
          recurringEventId: parentEvent.id,
          originalStartTime: instanceStart.toISOString(),
          isRecurringInstance: true
        });
        count++;
      }
    }
  }

  return instances;
}

// All routes require authentication
router.use(authMiddleware);

// Create event
router.post('/',
  [
    body('title').notEmpty().trim(),
    body('startTime').isISO8601(),
    body('endTime').isISO8601(),
    body('description').optional().trim(),
    body('reminderTime').optional().isInt({ min: 0 }),
    body('color').optional(),
    body('isImportant').optional().isBoolean(),
    body('calendarId').optional().isUUID(),
    body('isRecurring').optional().isBoolean(),
    body('recurringPattern').optional().isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, startTime, endTime, reminderTime, color, isImportant, calendarId, isRecurring, recurringPattern } = req.body;

      // For recurring weekly events, validate that start time day matches one of the selected days
      if (isRecurring && recurringPattern && recurringPattern.frequency === 'weekly' && recurringPattern.daysOfWeek) {
        const startDate = new Date(startTime);
        const startDayLocal = startDate.getDay(); // Use local day, not UTC

        if (!recurringPattern.daysOfWeek.includes(startDayLocal)) {
          console.warn(`Warning: Recurring event start day (${startDayLocal}) doesn't match selected days:`, recurringPattern.daysOfWeek);
          // Auto-fix: add the start day to the pattern
          recurringPattern.daysOfWeek = [...recurringPattern.daysOfWeek, startDayLocal].sort((a, b) => a - b);
          console.log('Auto-fixed pattern days:', recurringPattern.daysOfWeek);
        }
      }

      const event = await Event.create({
        userId: req.userId,
        calendarId: calendarId || null,
        title,
        description,
        startTime,
        endTime,
        reminderTime: reminderTime || 15,
        color: color || '#3174ad',
        isImportant: isImportant || false,
        isRecurring: isRecurring || false,
        recurringPattern: isRecurring ? recurringPattern : null
      });

      res.status(201).json({
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Server error creating event' });
    }
  }
);

// Get all events (with optional date filtering and calendar filtering)
router.get('/',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('calendarIds').optional()
  ],
  async (req, res) => {
    try {
      const { startDate, endDate, calendarIds } = req.query;

      const whereClause = {
        userId: req.userId,
        recurringEventId: null // Only get parent events, not instances
      };

      // Filter by calendar IDs if provided
      if (calendarIds) {
        const calendarIdArray = calendarIds.split(',');
        whereClause.calendarId = {
          [Op.in]: calendarIdArray
        };
      }

      // For non-recurring events, apply date filter
      const nonRecurringWhere = {
        ...whereClause,
        isRecurring: false
      };

      if (startDate && endDate) {
        nonRecurringWhere.startTime = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Get recurring events separately
      const recurringWhere = {
        ...whereClause,
        isRecurring: true
      };

      const [nonRecurringEvents, recurringEvents] = await Promise.all([
        Event.findAll({
          where: nonRecurringWhere,
          order: [['startTime', 'ASC']]
        }),
        Event.findAll({
          where: recurringWhere,
          order: [['startTime', 'ASC']]
        })
      ]);

      // Get all exceptions (modified/deleted instances)
      const exceptions = await Event.findAll({
        where: {
          userId: req.userId,
          recurringEventId: { [Op.not]: null }
        }
      });

      // Create a map of exceptions by parent ID and original start time
      const exceptionMap = new Map();
      exceptions.forEach(exception => {
        const key = `${exception.recurringEventId}_${new Date(exception.originalStartTime).toISOString()}`;
        exceptionMap.set(key, exception);
      });

      // Generate instances for recurring events
      let allEvents = [...nonRecurringEvents];

      if (startDate && endDate) {
        recurringEvents.forEach(recurringEvent => {
          const instances = generateRecurringInstances(recurringEvent, startDate, endDate);

          // Filter out instances that have been deleted or modified
          const validInstances = instances.filter(instance => {
            const key = `${recurringEvent.id}_${instance.originalStartTime}`;
            const exception = exceptionMap.get(key);

            // Skip if this is a deleted instance
            if (exception && exception.title.startsWith('[DELETED]')) {
              return false;
            }

            // Replace with exception if it exists
            if (exception && !exception.title.startsWith('[DELETED]')) {
              // Add the exception instead of the generated instance
              allEvents.push(exception);
              return false;
            }

            return true;
          });

          allEvents = allEvents.concat(validInstances);
        });
      } else {
        // If no date range, just return the parent recurring events
        allEvents = allEvents.concat(recurringEvents);
      }

      // Sort all events by start time
      allEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

      res.json({ events: allEvents });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: 'Server error fetching events' });
    }
  }
);

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Server error fetching event' });
  }
});

// Update recurring event series
router.put('/:id/series',
  [
    body('title').optional().notEmpty().trim(),
    body('description').optional().trim(),
    body('reminderTime').optional().isInt({ min: 0 }),
    body('color').optional(),
    body('isImportant').optional().isBoolean(),
    body('calendarId').optional().isUUID(),
    body('recurringPattern').optional().isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await Event.findOne({
        where: {
          id: req.params.id,
          userId: req.userId,
          isRecurring: true
        }
      });

      if (!event) {
        return res.status(404).json({ error: 'Recurring event not found' });
      }

      const { title, description, reminderTime, color, isImportant, calendarId, recurringPattern } = req.body;

      await event.update({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(reminderTime !== undefined && { reminderTime }),
        ...(color && { color }),
        ...(isImportant !== undefined && { isImportant }),
        ...(calendarId !== undefined && { calendarId }),
        ...(recurringPattern && { recurringPattern })
      });

      res.json({
        message: 'Recurring event series updated successfully',
        event
      });
    } catch (error) {
      console.error('Update recurring series error:', error);
      res.status(500).json({ error: 'Server error updating recurring event series' });
    }
  }
);

// Create exception (edit single instance of recurring event)
router.post('/:id/exception',
  [
    body('originalStartTime').isISO8601(),
    body('title').optional().notEmpty().trim(),
    body('startTime').optional().isISO8601(),
    body('endTime').optional().isISO8601(),
    body('description').optional().trim(),
    body('reminderTime').optional().isInt({ min: 0 }),
    body('color').optional(),
    body('isImportant').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const parentEvent = await Event.findOne({
        where: {
          id: req.params.id,
          userId: req.userId,
          isRecurring: true
        }
      });

      if (!parentEvent) {
        return res.status(404).json({ error: 'Recurring event not found' });
      }

      const { originalStartTime, title, startTime, endTime, description, reminderTime, color, isImportant } = req.body;

      // Calculate duration if times are changed
      const originalStart = new Date(originalStartTime);
      const originalEnd = new Date(originalStart.getTime() + (new Date(parentEvent.endTime) - new Date(parentEvent.startTime)));

      const exceptionEvent = await Event.create({
        userId: req.userId,
        calendarId: parentEvent.calendarId,
        title: title || parentEvent.title,
        description: description !== undefined ? description : parentEvent.description,
        startTime: startTime || originalStartTime,
        endTime: endTime || originalEnd.toISOString(),
        reminderTime: reminderTime !== undefined ? reminderTime : parentEvent.reminderTime,
        color: color || parentEvent.color,
        isImportant: isImportant !== undefined ? isImportant : parentEvent.isImportant,
        recurringEventId: parentEvent.id,
        originalStartTime: originalStartTime,
        isRecurring: false
      });

      res.status(201).json({
        message: 'Exception created successfully',
        event: exceptionEvent
      });
    } catch (error) {
      console.error('Create exception error:', error);
      res.status(500).json({ error: 'Server error creating exception' });
    }
  }
);

// Delete single instance of recurring event
router.delete('/:id/instance',
  [
    body('originalStartTime').isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const parentEvent = await Event.findOne({
        where: {
          id: req.params.id,
          userId: req.userId,
          isRecurring: true
        }
      });

      if (!parentEvent) {
        return res.status(404).json({ error: 'Recurring event not found' });
      }

      const { originalStartTime } = req.body;

      // Create a "deleted" exception with a special flag
      // We'll mark it as an exception with no data to indicate it's deleted
      await Event.create({
        userId: req.userId,
        calendarId: parentEvent.calendarId,
        title: `[DELETED] ${parentEvent.title}`,
        description: 'Deleted instance',
        startTime: originalStartTime,
        endTime: originalStartTime,
        recurringEventId: parentEvent.id,
        originalStartTime: originalStartTime,
        isRecurring: false,
        color: '#000000'
      });

      res.json({ message: 'Instance deleted successfully' });
    } catch (error) {
      console.error('Delete instance error:', error);
      res.status(500).json({ error: 'Server error deleting instance' });
    }
  }
);

// Delete entire recurring event series
router.delete('/:id/series', async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
        isRecurring: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Recurring event not found' });
    }

    // Delete all exceptions first
    await Event.destroy({
      where: {
        recurringEventId: req.params.id,
        userId: req.userId
      }
    });

    // Delete the parent event
    await event.destroy();

    res.json({ message: 'Recurring event series deleted successfully' });
  } catch (error) {
    console.error('Delete series error:', error);
    res.status(500).json({ error: 'Server error deleting recurring event series' });
  }
});

// Update event
router.put('/:id',
  [
    body('title').optional().notEmpty().trim(),
    body('startTime').optional().isISO8601(),
    body('endTime').optional().isISO8601(),
    body('description').optional().trim(),
    body('reminderTime').optional().isInt({ min: 0 }),
    body('color').optional(),
    body('isImportant').optional().isBoolean(),
    body('calendarId').optional().isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await Event.findOne({
        where: {
          id: req.params.id,
          userId: req.userId
        }
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const { title, description, startTime, endTime, reminderTime, color, isImportant, calendarId } = req.body;

      await event.update({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(reminderTime !== undefined && { reminderTime }),
        ...(color && { color }),
        ...(isImportant !== undefined && { isImportant }),
        ...(calendarId !== undefined && { calendarId })
      });

      res.json({
        message: 'Event updated successfully',
        event
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Server error updating event' });
    }
  }
);

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await event.destroy();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Server error deleting event' });
  }
});

module.exports = router;
