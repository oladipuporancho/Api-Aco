const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    volume: { type: String, required: true },
    issue: { type: Number, default: null },
    page: { type: mongoose.Schema.Types.Mixed, required: true }, 
    file: { type: String, default: null },
  },
  { timestamps: true }
);

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;
