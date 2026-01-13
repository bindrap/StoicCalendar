const express = require('express');
const { Quote } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get daily quote
router.get('/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let todayQuote = await Quote.findOne({
      where: {
        dateUsed: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    if (!todayQuote) {
      todayQuote = await Quote.findOne({
        where: {
          [Op.or]: [
            { dateUsed: null },
            { dateUsed: { [Op.lt]: today } }
          ]
        },
        order: [['dateUsed', 'ASC NULLS FIRST']]
      });

      if (todayQuote) {
        await todayQuote.update({ dateUsed: today });
      }
    }

    if (!todayQuote) {
      return res.status(404).json({ error: 'No quotes available' });
    }

    res.json({ quote: todayQuote });
  } catch (error) {
    console.error('Get daily quote error:', error);
    res.status(500).json({ error: 'Server error fetching quote' });
  }
});

// Get random quote
router.get('/random', async (req, res) => {
  try {
    const count = await Quote.count();
    const randomIndex = Math.floor(Math.random() * count);

    const quote = await Quote.findOne({
      offset: randomIndex
    });

    if (!quote) {
      return res.status(404).json({ error: 'No quotes available' });
    }

    res.json({ quote });
  } catch (error) {
    console.error('Get random quote error:', error);
    res.status(500).json({ error: 'Server error fetching quote' });
  }
});

module.exports = router;
