const mongoose = require('mongoose');

const VerdictSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  text: { type: String, required: true },
  raw: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Verdict', VerdictSchema);
