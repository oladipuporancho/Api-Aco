const Journal = require('../models/Journal');

const postJournal = async (req, res) => {
  try {
    const { title, content, date, volume, issue, page } = req.body;

    // Validate required fields
    if (!title || !content || !volume || page === undefined || page === null) {
      return res.status(400).json({
        message: 'All required fields (title, content, volume, page) must be provided.',
      });
    }

    // Validate issue as a positive number if provided
    if (issue && (isNaN(issue) || Number(issue) <= 0)) {
      return res.status(400).json({
        message: 'The issue field must be a positive number.',
      });
    }

    // Validate content length
    if (content.length < 10) {
      return res.status(400).json({
        message: 'The content field must be at least 10 characters long.',
      });
    }

    // Create a new journal entry
    const journal = new Journal({
      title,
      content,
      date: date || new Date(),
      volume,
      issue: issue ? Number(issue) : null,
      page, // No validation on `page` type
      file: req.file ? req.file.path : null,
    });

    await journal.save();
    res.status(201).json({ message: 'Journal created successfully!', journal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getJournals = async (req, res) => {
  try {
    const journals = await Journal.find().sort({ createdAt: -1 }); // Fetch all journals

    res.status(200).json({
      message: 'Journals retrieved successfully!',
      journals,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching journals', error: error.message });
  }
};

const updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, volume, issue, page } = req.body;

    // Validate issue as a positive number if provided
    if (issue && (isNaN(issue) || Number(issue) <= 0)) {
      return res.status(400).json({
        message: 'The issue field must be a positive number.',
      });
    }

    // Validate content length if provided
    if (content && content.length < 10) {
      return res.status(400).json({
        message: 'The content field must be at least 10 characters long.',
      });
    }

    const updatedData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(volume && { volume }),
      ...(issue && { issue: Number(issue) }),
      ...(page !== undefined && { page }), // No type validation for `page`
      ...(req.file && { file: req.file.path }),
    };

    const journal = await Journal.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true,
    });

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    res.status(200).json({ message: 'Journal updated successfully!', journal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;

    const journal = await Journal.findByIdAndDelete(id);

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    res.status(200).json({ message: 'Journal deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { postJournal, getJournals, updateJournal, deleteJournal };
