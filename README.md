# JurisAI — AI-Powered Mock Trial System

This repository contains a minimal, modular prototype of JurisAI: a mock-trial system where two parties upload documents, submit arguments, and an AI Judge (via Groq LLM) produces a verdict. The goal is a starting point to iterate toward production.

Quick start (dev)
------------------
Requirements: Node 18+, npm, MongoDB running locally (or set MONGODB_URI)

1. Backend

```bash
cd server
npm install
# set MONGODB_URI and GROQ_API_KEY in .env if available
npm run dev
```

Server will be running on http://localhost:5100

2. Frontend

```bash
cd jurisai
npm install
npm run dev
```

Project layout
--------------
- `server/` — Express backend, Mongoose models, Groq client wrapper, API routes.
- `jurisai/` — React (Vite + TS) frontend with upload, argument panels and SSE.
- `DESIGN.md` — design rationale and next steps.

Notes
-----
- The `server/lib/groqClient.js` is a simple wrapper. If `GROQ_API_KEY` is not set, the server will return a mocked verdict so you can iterate locally.
- File parsing uses `pdf-parse` and `mammoth` for DOCX. Large files should be processed asynchronously in production.
