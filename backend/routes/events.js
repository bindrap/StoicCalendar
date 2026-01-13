const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Event } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

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
    body('calendarId').optional().isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, startTime, endTime, reminderTime, color, isImportant, calendarId } = req.body;

      const event = await Event.create({
        userId: req.userId,
        calendarId: calendarId || null,
        title,
        description,
        startTime,
        endTime,
        reminderTime: reminderTime || 15,
        color: color || '#3174ad',
        isImportant: isImportant || false
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
        userId: req.userId
      };

      if (startDate && endDate) {
        whereClause.startTime = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Filter by calendar IDs if provided
      if (calendarIds) {
        const calendarIdArray = calendarIds.split(',');
        whereClause.calendarId = {
          [Op.in]: calendarIdArray
        };
      }

      const events = await Event.findAll({
        where: whereClause,
        order: [['startTime', 'ASC']]
      });

      res.json({ events });
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
