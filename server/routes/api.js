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

// Upload documents (PDF, docx, txt)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { side, caseTitle } = req.body; // side: 'plaintiff' or 'defense'
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

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

    // Create or update case
    let existing = await Case.findOne({ title: caseTitle });
    if (!existing) {
      existing = new Case({ title: caseTitle || `Case ${Date.now()}`, documents: [] });
    }
    existing.documents.push({ filename: file.originalname, side: side || 'unknown', content: text });
    await existing.save();

    sendSSE({ type: 'upload', caseId: existing._id, filename: file.originalname });

    res.json({ caseId: existing._id, message: 'Uploaded and parsed' });
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

    // Build a prompt for the LLM
    const prompt = [];
    prompt.push(`You are an AI Judge. Analyze the following case and deliver a concise verdict with reasoning.`);
    if (contextNote) prompt.push(`Context note: ${contextNote}`);
    prompt.push(`Case Title: ${c.title}`);
    c.documents.forEach((d, i) => {
      prompt.push(`Document ${i + 1} (side=${d.side}, filename=${d.filename}):\n${d.content.substring(0, 8000)}`);
    });
    if (args && args.length) {
      prompt.push('Arguments and counterarguments in chronological order:');
      args.forEach((a, i) => prompt.push(`${i + 1}. [${a.side}] ${a.text}`));
    }

    const input = prompt.join('\n\n');

    // Call Groq client - wrapper returns { verdictText }
    const result = await groq.requestVerdict({ caseId, prompt: input });

    const v = new Verdict({ caseId, text: result.verdictText, raw: result.raw });
    await v.save();

    sendSSE({ type: 'verdict', caseId, verdictId: v._id, text: v.text });

    res.json(v);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
