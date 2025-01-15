const Journal = require('../models/Journal');

// Controller to handle posting a journal
const postJournal = async (req, res) => {
  try {
    const { title, content, date, volume, issue } = req.body;

    // Validate required fields
    if (!title || !content || !date || !volume) {
      return res.status(400).json({
        message: 'All required fields (title, content, date, volume) must be provided.',
      });
    }

    // Validate issue as a number if provided
    if (issue && isNaN(issue)) {
      return res.status(400).json({
        message: 'The issue field must be a valid number.',
      });
    }

    // Create a new journal entry
    const journal = new Journal({
      title,
      content,
      date,
      volume,
      issue: issue ? Number(issue) : null, // Convert issue to a number or set it to null
      file: req.file ? req.file.path : null, // Save file path if uploaded
    });

    await journal.save();
    res.status(201).json({ message: 'Journal created successfully!', journal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Controller to handle fetching all journals
const getJournals = async (req, res) => {
  try {
    const journals = await Journal.find(); // Fetch all journals from the database
    res.status(200).json({ message: 'Journals retrieved successfully!', journals });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching journals', error: error.message });
  }
};

module.exports = { postJournal, getJournals };
