
// pending-researches-router.js

const express = require('express');
const router = express.Router();
const { fetchPendingResearchesFromDatabase } = require('../database/db'); // Import your database module and function

// Define route to fetch pending researches
router.get('/pending-researches', async (req, res) => {
  try {
    // Fetch pending researches from the database
    const pendingResearches = await fetchPendingResearchesFromDatabase(); // Implement this function in your database module

    // Send the pending researches as a JSON response
    res.json(pendingResearches);
  } catch (error) {
    console.error('Error fetching pending researches:', error);
    res.status(500).json({ error: 'Error fetching pending researches' });
  }
});

module.exports = router;
