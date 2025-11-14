const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

const Case = require('../models/case');
const Argument = require('../models/argument');
const Verdict = require('../models/verdict');
const groq = require('../lib/groqClient');

// Simple in-memory SSE broadcaster
const sseClients = [];

function sendSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(res => res.write(payload));
}

// SSE endpoint for clients to receive updates
router.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();
  res.write('retry: 10000\n\n');

  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Create a new case
router.post('/create-case', async (req, res) => {
  try {
    const { title, type, createdAt } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    // Check if case already exists with the same title
    const existing = await Case.findOne({ title });
    if (existing) {
      return res.json({ caseId: existing._id, message: 'Case already exists', existing: true });
    }

    // Create new case
    const newCase = new Case({ 
      title, 
      caseType: type || 'civil',
      documents: [],
      metadata: {
        createdAt: createdAt || new Date().toISOString(),
        status: 'active'
      }
    });
    
    await newCase.save();

    sendSSE({ type: 'case_created', caseId: newCase._id, title });

    res.json({ 
      caseId: newCase._id, 
      message: 'Case created successfully',
      title: newCase.title,
      type: newCase.caseType
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Upload documents (PDF, docx, txt)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { side, documentName, caseId } = req.body; // side: 'plaintiff' or 'defense', documentName: custom name, caseId: target case
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!caseId) return res.status(400).json({ error: 'caseId is required' });

    const ext = path.extname(file.originalname).toLowerCase();
    let text = '';
    const buffer = fs.readFileSync(file.path);
    if (ext === '.pdf') {
      const data = await pdf(buffer);
      text = data.text;
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      // treat as plain text
      text = buffer.toString('utf8');
    }

    // Find the specific case by ID
    const targetCase = await Case.findById(caseId);
    if (!targetCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Use documentName if provided, otherwise use original filename
    const displayName = documentName || file.originalname;
    
    targetCase.documents.push({ 
      filename: displayName, 
      side: side || 'unknown', 
      content: text 
    });
    await targetCase.save();

    sendSSE({ type: 'upload', caseId: targetCase._id, filename: displayName });

    res.json({ caseId: targetCase._id, message: 'Uploaded and parsed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get case details
router.get('/case/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    const caseData = await Case.findById(caseId).lean();
    
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    const arguments = await Argument.find({ caseId }).sort({ createdAt: 1 }).lean();
    const verdicts = await Verdict.find({ caseId }).sort({ createdAt: 1 }).lean();
    
    res.json({
      ...caseData,
      arguments,
      verdicts,
      argumentCount: arguments.length,
      verdictCount: verdicts.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Submit an argument
router.post('/argument', async (req, res) => {
  try {
    const { caseId, side, text } = req.body;
    if (!caseId || !text) return res.status(400).json({ error: 'caseId and text are required' });

    const arg = new Argument({ caseId, side: side || 'unknown', text });
    await arg.save();

    // notify clients
    sendSSE({ type: 'argument', caseId, argumentId: arg._id, side, text });

    // Optionally re-evaluate the verdict asynchronously
    // For now, return saved argument and let frontend trigger /verdict if needed
    res.json(arg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Trigger verdict generation using Groq
router.post('/verdict', async (req, res) => {
  try {
    const { caseId, contextNote } = req.body;
    if (!caseId) return res.status(400).json({ error: 'caseId is required' });

    const c = await Case.findById(caseId).lean();
    if (!c) return res.status(404).json({ error: 'Case not found' });

    const args = await Argument.find({ caseId }).sort({ createdAt: 1 }).lean();
    const previousDecisions = await Verdict.find({ caseId }).sort({ createdAt: 1 }).lean();
    
    // Determine request type based on existing decisions and arguments
    let requestType = 'initial';
    if (previousDecisions.length > 0) {
      const totalArgs = args.length;
      const initialArgsCount = Math.min(2, totalArgs); // First argument from each side
      const counterArgsCount = totalArgs - initialArgsCount;
      
      if (counterArgsCount >= 8) { // 4 counter-arguments from each side suggests case needs conclusion
        requestType = 'final';
      } else if (counterArgsCount > 0) {
        requestType = 'interim';
      }
    }

    // Call Groq client with Indian legal context and full case history
    const result = await groq.requestVerdict({ 
      caseId, 
      case: c, 
      arguments: args, 
      previousDecisions,
      contextNote,
      requestType 
    });

    const v = new Verdict({ caseId, text: result.verdictText, raw: result.raw });
    await v.save();

    sendSSE({ type: 'verdict', caseId, verdictId: v._id, text: v.text });

    res.json(v);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Handle case surrender
router.post('/surrender', async (req, res) => {
  try {
    const { caseId, side } = req.body;
    if (!caseId || !side) return res.status(400).json({ error: 'caseId and side are required' });

    // Create a surrender verdict
    const surrenderText = `**CASE SURRENDER - MOCK TRIAL PROCEEDING**\n\n**CASE ID:** ${caseId}\n**SURRENDERING PARTY:** ${side.toUpperCase()}\n\n**JUDICIAL NOTICE:** The ${side} party has formally surrendered in this mock trial proceeding. Under Indian legal practice, this constitutes an admission and withdrawal from the case.\n\n**ORDER:** Case concluded due to surrender by ${side} party.\n\n**RESULT:** Judgment by default in favor of the opposing party.\n\n**MOCK TRIAL DISCLAIMER:** This is an educational legal simulation based on Indian legal procedures.`;
    
    const v = new Verdict({ 
      caseId, 
      text: surrenderText, 
      raw: { 
        surrenderedBy: side, 
        type: 'surrender',
        timestamp: new Date().toISOString() 
      } 
    });
    await v.save();

    sendSSE({ type: 'surrender', caseId, side, verdictId: v._id });

    res.json({ message: `Case surrendered by ${side}`, verdict: v });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
