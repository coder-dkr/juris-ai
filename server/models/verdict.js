const mongoose = require('mongoose');

const VerdictSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  text: { type: String, required: true },
  verdictType: { type: String, enum: ['initial', 'interim', 'final'], default: 'initial' },
  structured: {
    summary: { type: String },
    analysis: {
      plaintiffStrength: { type: Number, min: 0, max: 100 },
      defenseStrength: { type: Number, min: 0, max: 100 },
      keyPoints: [{ type: String }],
      legalBasis: [{ type: String }]
    },
    argumentReview: {
      newArguments: [{
        side: { type: String },
        summary: { type: String },
        impact: { type: String, enum: ['strengthens', 'weakens', 'neutral'] },
        legalMerit: { type: Number, min: 0, max: 100 }
      }],
      stanceChange: { type: String },
      overruledPoints: [{ type: String }]
    },
    ruling: {
      decision: { type: String },
      confidence: { type: Number, min: 0, max: 100 },
      recommendation: { type: String, enum: ['continue', 'settle', 'final'] }
    },
    metadata: {
      previousDecisionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Verdict' },
      argumentsConsidered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Argument' }]
    }
  },
  raw: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Verdict', VerdictSchema);
