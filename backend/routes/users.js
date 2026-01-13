const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Update user preferences
router.put('/preferences',
  [
    body('emailNotifications').optional().isBoolean(),
    body('smsNotifications').optional().isBoolean(),
    body('dailyQuote').optional().isBoolean(),
    body('quoteDelivery').optional().isIn(['web', 'email', 'sms']),
    body('defaultReminderTime').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findByPk(req.userId);

      const updatedPreferences = {
        ...user.preferences,
        ...req.body
      };

      await user.update({ preferences: updatedPreferences });

      res.json({
        message: 'Preferences updated successfully',
        preferences: user.preferences
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ error: 'Server error updating preferences' });
    }
  }
);

// Update user profile
router.put('/profile',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, phone } = req.body;
      const user = await User.findByPk(req.userId);

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      await user.update({
        ...(email && { email }),
        ...(phone !== undefined && { phone })
      });

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          preferences: user.preferences
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Server error updating profile' });
    }
  }
);

module.exports = router;
