const Journal = require('../models/Journal');

const postJournal = async (req, res) => {
  try {
    const { title, content, volume, issue } = req.body;

    // Validate required fields
    if (!title || !content || !volume) {
      return res.status(400).json({
        message: 'All required fields (title, content, volume) must be provided.',
      });
    }

    // Validate issue as a number if provided
    if (issue && isNaN(issue)) {
      return res.status(400).json({
        message: 'The issue field must be a valid number.',
      });
    }

    // Create a new journal entry with the current date
    const journal = new Journal({
      title,
      content,
      date: new Date(), // Automatically generate the current date and time
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

// fetching all journals
const getJournals = async (req, res) => {
  try {
    const journals = await Journal.find().select('title content date volume issue file'); // Fetch all journals and select specific fields
    res.status(200).json({ message: 'Journals retrieved successfully!', journals });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching journals', error: error.message });
  }
};

const updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, volume, issue } = req.body;

    // Validate issue as a number if provided
    if (issue && isNaN(issue)) {
      return res.status(400).json({
        message: 'The issue field must be a valid number.',
      });
    }

    const updatedData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(volume && { volume }),
      ...(issue && { issue: Number(issue) }),
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
