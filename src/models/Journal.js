const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  volume: { type: Number, required: true },
  issue: { type: Number, required: false },
  file: { type: String, required: false }, 
});

module.exports = mongoose.model('Journal', journalSchema);
