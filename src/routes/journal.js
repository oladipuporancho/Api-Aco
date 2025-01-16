const express = require('express');
const multer = require('multer');
const { postJournal, getJournals, updateJournal, deleteJournal } = require('../controllers/journalController');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to 'uploads/' directory
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Generate unique filenames
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedTypes = [
    'application/pdf',            // PDF files
    'image/jpeg',                 // JPEG images
    'image/png',                  // PNG images
    'image/gif',                  // GIF images
    'application/msword',         // .doc files
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx files
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only PDFs, images, and Word documents are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter,
});

// create a journal
router.post('/journals', upload.single('file'), async (req, res) => {
  try {
    await postJournal(req, res); // Call the postJournal controller
  } catch (err) {
    res.status(500).json({ message: 'Error handling file upload', error: err.message });
  }
});

// GET route to fetch all journals
router.get('/journals', async (req, res) => {
  try {
    await getJournals(req, res); // Call the getJournals controller
  } catch (err) {
    res.status(500).json({ message: 'Error fetching journals', error: err.message });
  }
});

// PUT route to update a journal
router.put('/journals/:id', upload.single('file'), async (req, res) => {
  try {
    await updateJournal(req, res); // Call the updateJournal controller
  } catch (err) {
    res.status(500).json({ message: 'Error updating journal', error: err.message });
  }
});

// DELETE route to delete a journal
router.delete('/journals/:id', async (req, res) => {
  try {
    await deleteJournal(req, res); // Call the deleteJournal controller
  } catch (err) {
    res.status(500).json({ message: 'Error deleting journal', error: err.message });
  }
});

module.exports = router;
