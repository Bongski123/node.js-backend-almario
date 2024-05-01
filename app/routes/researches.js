const express = require('express');
const path = require('path');
const db = require('../config/database');

const router = express.Router();
const app = express();

// Define the directory where PDF files are stored
const pdfDirectory = path.join(__dirname, 'public', 'pdfs');

// Serve PDF files based on the researches' file_name
router.get('/pdf/:file_name', (req, res) => {
  const file_name = req.params.file_name;

  // Query the researches table to get the file_name
  const query = `SELECT file_name FROM researches WHERE file_name = ?`;
  db.query(query, [file_name], (err, results) => {
    if (err) {
      console.error('Error querying researches table:', err);
      res.status(500).send('Internal server error');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('Research document not found');
      return;
    }

    const fileName = results[0].file_name;
    const filePath = path.join(pdfDirectory, fileName);

    // Serve the file
    res.sendFile(filePath);
  });
});

module.exports = router;