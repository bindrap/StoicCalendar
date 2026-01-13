const express = require('express');
const { body, validationResult } = require('express-validator');
const { ContactInfo } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get all contacts for current user
router.get('/', async (req, res) => {
  try {
    const contacts = await ContactInfo.findAll({
      where: { userId: req.userId },
      order: [['type', 'ASC'], ['isPrimary', 'DESC'], ['createdAt', 'ASC']]
    });

    res.json({ contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Server error fetching contacts' });
  }
});

// Add new contact
router.post('/',
  [
    body('type').isIn(['email', 'phone']),
    body('value').notEmpty().trim(),
    body('label').optional().trim(),
    body('receiveNotifications').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, value, label, receiveNotifications } = req.body;

      // Check if contact already exists
      const existing = await ContactInfo.findOne({
        where: {
          userId: req.userId,
          type,
          value
        }
      });

      if (existing) {
        return res.status(400).json({ error: 'Contact already exists' });
      }

      // Check if this should be primary (if no other primary exists)
      const primaryExists = await ContactInfo.findOne({
        where: {
          userId: req.userId,
          type,
          isPrimary: true
        }
      });

      const contact = await ContactInfo.create({
        userId: req.userId,
        type,
        value,
        label: label || null,
        receiveNotifications: receiveNotifications !== false,
        isPrimary: !primaryExists
      });

      res.status(201).json({
        message: 'Contact added successfully',
        contact
      });
    } catch (error) {
      console.error('Add contact error:', error);
      if (error.message.includes('Invalid')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error adding contact' });
    }
  }
);

// Update contact
router.put('/:id',
  [
    body('label').optional().trim(),
    body('receiveNotifications').optional().isBoolean(),
    body('isPrimary').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const contact = await ContactInfo.findOne({
        where: {
          id: req.params.id,
          userId: req.userId
        }
      });

      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      const { label, receiveNotifications, isPrimary } = req.body;

      // If setting as primary, unset other primaries of same type
      if (isPrimary === true) {
        await ContactInfo.update(
          { isPrimary: false },
          {
            where: {
              userId: req.userId,
              type: contact.type,
              id: { [require('sequelize').Op.ne]: contact.id }
            }
          }
        );
      }

      await contact.update({
        ...(label !== undefined && { label }),
        ...(receiveNotifications !== undefined && { receiveNotifications }),
        ...(isPrimary !== undefined && { isPrimary })
      });

      res.json({
        message: 'Contact updated successfully',
        contact
      });
    } catch (error) {
      console.error('Update contact error:', error);
      res.status(500).json({ error: 'Server error updating contact' });
    }
  }
);

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const contact = await ContactInfo.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // If deleting primary contact, set another one as primary
    if (contact.isPrimary) {
      const nextContact = await ContactInfo.findOne({
        where: {
          userId: req.userId,
          type: contact.type,
          id: { [require('sequelize').Op.ne]: contact.id }
        }
      });

      if (nextContact) {
        await nextContact.update({ isPrimary: true });
      }
    }

    await contact.destroy();

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Server error deleting contact' });
  }
});

module.exports = router;
