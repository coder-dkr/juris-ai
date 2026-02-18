# JurisAI — AI-Powered Mock Trial System

This repository contains a minimal, modular prototype of JurisAI: a mock-trial system where two parties upload documents, submit arguments, and an AI Judge (via Groq LLM) produces a verdict. The goal is a starting point to iterate toward production.

## Quick Start (Dev)

**Requirements**: Node 18+, npm, MongoDB running locally (or set MONGODB_URI).

### 1. Backend Setup

```bash
cd server
npm install
# Set up environment variables in .env (see .env.example)
# MONGODB_URI=mongodb://localhost:27017/jurisai
# GROQ_API_KEY=your_groq_api_key
# GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions (check specific endpoint)

npm run dev
```

Server will be running on `http://localhost:5100`.

### 2. Frontend Setup

```bash
cd jurisai
npm install
npm run dev
```

The frontend will verify the server connection and allow you to create cases.

---

## Project Layout

- `server/`: Express backend, Mongoose models, Groq client wrapper, API routes.
- `jurisai/`: React (Vite + TS) frontend with upload, argument panels, and SSE.

## Usage Guide & Mock Trial Flow

1.  **Create a Case**: Enter a title and select a case type (Civil/Criminal) on the home page.
2.  **Upload Documents**:
    - Upload PDFs, DOCX, or Text files for both **Plaintiff** and **Defense** sides.
    - The system parses these files and attaches them to the case context.
3.  **Arguments**:
    - Parties take turns submitting arguments.
    - Arguments are stored and broadcasted in real-time.
4.  **AI Verdict**:
    - Click "Request Verdict" to have the AI Judge analyze the case context, documents, and arguments.
    - The AI will generate an **Interim Order** or **Final Judgment** based on the stage of the trial.
5.  **Surrender**: A party can choose to surrender, effectively ending the trial with a default judgment for the opposing side.

---

## API Documentation

The backend exposes a REST API at `http://localhost:5100/api`.

### Endpoints

#### `GET /api/events`

Establishes a Server-Sent Events (SSE) connection for real-time updates (case creation, uploads, arguments, verdicts).

#### `POST /api/create-case`

Creates a new legal case.

- **Body**: `{ "title": "Case Title", "type": "civil" }`
- **Returns**: `{ "caseId": "...", "title": "...", "type": "..." }`

#### `POST /api/upload`

Uploads a document for a specific case and side.

- **Body**: Form-data with `file` (binary), `caseId`, `side` (plaintiff/defense), `documentName` (optional).
- **Returns**: `{ "caseId": "...", "message": "Uploaded and parsed" }`

#### `GET /api/case/:caseId`

Retrieves full details of a specific case, including metadata, arguments, and past verdicts.

#### `POST /api/argument`

Submits an argument for a specific side.

- **Body**: `{ "caseId": "...", "side": "plaintiff", "text": "Argument content..." }`
- **Returns**: Created argument object.

#### `POST /api/verdict`

Requests an AI-generated verdict based on current case state.

- **Body**: `{ "caseId": "...", "contextNote": "Optional context..." }`
- **Returns**: `{ "verdictId": "...", "text": "Verdict content...", "verdictType": "interim/final" }`

#### `POST /api/surrender`

Formal surrender by one party.

- **Body**: `{ "caseId": "...", "side": "defense" }`
- **Returns**: Verdict object confirming surrender.

---

## Notes

- **Groq Integration**: `server/lib/groqClient.js` handles communication with the Groq API. If `GROQ_API_KEY` is not set, the server currently mocks the verdict for local testing.
- **File Parsing**: Uses `pdf-parse` for PDFs and `mammoth` for DOCX files.
- **YouTube Demo**: [Watch the Demo](https://youtu.be/ubz8KSRnhU0)
