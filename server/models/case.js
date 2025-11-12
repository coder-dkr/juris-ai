const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  filename: String,
  side: String,
  content: String,
  uploadedAt: { type: Date, default: Date.now }
});

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  documents: [DocumentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Case', CaseSchema);
