const express = require('express');
const { body, validationResult } = require('express-validator');
const { Calendar, Event, User } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create calendar
router.post('/',
  [
    body('name').notEmpty().trim(),
    body('description').optional().trim(),
    body('color').optional(),
    body('isDefault').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, color, isDefault } = req.body;

      const calendar = await Calendar.create({
        ownerId: req.userId,
        name,
        description,
        color: color || '#3174ad',
        isDefault: isDefault || false
      });

      res.status(201).json({
        message: 'Calendar created successfully',
        calendar
      });
    } catch (error) {
      console.error('Create calendar error:', error);
      res.status(500).json({ error: 'Server error creating calendar' });
    }
  }
);

// Get all calendars (owned + shared with user)
router.get('/', async (req, res) => {
  try {
    // Get calendars owned by the user
    const ownedCalendars = await Calendar.findAll({
      where: { ownerId: req.userId },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'email']
      }],
      order: [['createdAt', 'ASC']]
    });

    // Get calendars shared with the user
    const sharedCalendars = await Calendar.findAll({
      where: {
        isShared: true,
        sharedWith: {
          [Op.contains]: [req.userId]
        }
      },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'email']
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      owned: ownedCalendars,
      shared: sharedCalendars
    });
  } catch (error) {
    console.error('Get calendars error:', error);
    res.status(500).json({ error: 'Server error fetching calendars' });
  }
});

// Get single calendar
router.get('/:id', async (req, res) => {
  try {
    const calendar = await Calendar.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { ownerId: req.userId },
          {
            isShared: true,
            sharedWith: {
              [Op.contains]: [req.userId]
            }
          }
        ]
      },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'email']
      }]
    });

    if (!calendar) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    res.json({ calendar });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Server error fetching calendar' });
  }
});

// Update calendar
router.put('/:id',
  [
    body('name').optional().notEmpty().trim(),
    body('description').optional().trim(),
    body('color').optional(),
    body('isDefault').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const calendar = await Calendar.findOne({
        where: {
          id: req.params.id,
          ownerId: req.userId
        }
      });

      if (!calendar) {
        return res.status(404).json({ error: 'Calendar not found or you do not have permission' });
      }

      const { name, description, color, isDefault } = req.body;

      await calendar.update({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(isDefault !== undefined && { isDefault })
      });

      res.json({
        message: 'Calendar updated successfully',
        calendar
      });
    } catch (error) {
      console.error('Update calendar error:', error);
      res.status(500).json({ error: 'Server error updating calendar' });
    }
  }
);

// Delete calendar
router.delete('/:id', async (req, res) => {
  try {
    const calendar = await Calendar.findOne({
      where: {
        id: req.params.id,
        ownerId: req.userId
      }
    });

    if (!calendar) {
      return res.status(404).json({ error: 'Calendar not found or you do not have permission' });
    }

    await calendar.destroy();

    res.json({ message: 'Calendar deleted successfully' });
  } catch (error) {
    console.error('Delete calendar error:', error);
    res.status(500).json({ error: 'Server error deleting calendar' });
  }
});

// Share calendar with user (by email)
router.post('/:id/share',
  [
    body('email').isEmail().normalizeEmail(),
    body('permission').optional().isIn(['view', 'edit'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const calendar = await Calendar.findOne({
        where: {
          id: req.params.id,
          ownerId: req.userId
        }
      });

      if (!calendar) {
        return res.status(404).json({ error: 'Calendar not found or you do not have permission' });
      }

      const { email, permission } = req.body;

      // Find user by email
      const userToShare = await User.findOne({ where: { email } });
      if (!userToShare) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't allow sharing with self
      if (userToShare.id === req.userId) {
        return res.status(400).json({ error: 'Cannot share calendar with yourself' });
      }

      // Add user to sharedWith array if not already there
      const sharedWith = calendar.sharedWith || [];
      if (!sharedWith.includes(userToShare.id)) {
        sharedWith.push(userToShare.id);
      }

      // Update permissions
      const permissions = calendar.permissions || {};
      permissions[userToShare.id] = permission || 'view';

      await calendar.update({
        isShared: true,
        sharedWith,
        permissions
      });

      res.json({
        message: 'Calendar shared successfully',
        calendar
      });
    } catch (error) {
      console.error('Share calendar error:', error);
      res.status(500).json({ error: 'Server error sharing calendar' });
    }
  }
);

// Unshare calendar with user
router.delete('/:id/share/:userId', async (req, res) => {
  try {
    const calendar = await Calendar.findOne({
      where: {
        id: req.params.id,
        ownerId: req.userId
      }
    });

    if (!calendar) {
      return res.status(404).json({ error: 'Calendar not found or you do not have permission' });
    }

    const userIdToRemove = req.params.userId;

    // Remove user from sharedWith array
    const sharedWith = (calendar.sharedWith || []).filter(id => id !== userIdToRemove);

    // Remove user from permissions
    const permissions = calendar.permissions || {};
    delete permissions[userIdToRemove];

    await calendar.update({
      isShared: sharedWith.length > 0,
      sharedWith,
      permissions
    });

    res.json({
      message: 'Calendar unshared successfully',
      calendar
    });
  } catch (error) {
    console.error('Unshare calendar error:', error);
    res.status(500).json({ error: 'Server error unsharing calendar' });
  }
});

// Get events for a specific calendar
router.get('/:id/events', async (req, res) => {
  try {
    const calendar = await Calendar.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { ownerId: req.userId },
          {
            isShared: true,
            sharedWith: {
              [Op.contains]: [req.userId]
            }
          }
        ]
      }
    });

    if (!calendar) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    const events = await Event.findAll({
      where: { calendarId: req.params.id },
      order: [['startTime', 'ASC']]
    });

    res.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Server error fetching calendar events' });
  }
});

module.exports = router;
