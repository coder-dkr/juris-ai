JurisAI - Design Decisions

Overview
--------
JurisAI is a mock-trial platform with a React frontend, Express backend, MongoDB persistence, and Groq LLM integration for verdict generation. The system favors low-latency LLM calls and real-time UX using Server-Sent Events (SSE).

Tech choices
------------
- React (Vite + TypeScript): fast dev feedback and component model for interactive panels.
- Express.js: lightweight HTTP server; familiar ecosystem and easy middleware.
- MongoDB (Mongoose): flexible document model for cases, arguments, and verdicts.
- SSE: simple uni-directional real-time updates (server -> client). Easier to scale and stable for event streams like verdict updates. WebSockets can be added later for bi-directional real-time.
- Groq LLM: chosen for low-latency inference. Integration is wrapped behind a single module (`server/lib/groqClient.js`) so it can be replaced by the official SDK or extended with batching.

Architecture notes
------------------
- Separation of concerns: routes, models and the LLM client are modular.
- Documents are parsed on upload (pdf-parse, mammoth) and stored as extracted text to keep LLM input small and searchable.
- Prompt design: the backend composes a clear prompt containing case metadata, documents, and chronological arguments. The prompt is truncated per-document to keep within token limits.

Scaling & optimizations
-----------------------
- Cache embeddings or verdicts in Redis for repeated queries.
- Offload heavy parsing to background workers (Bull/Redis) for large files.
- Use Kubernetes with HPA and a managed MongoDB (Atlas) for resilience.

Security & privacy
------------------
- Use HTTPS in production and secure the Groq API key via environment variables or a secrets manager.
- Redact PII from documents if required by policy.

Next steps
----------
- Add case similarity search using vector embeddings (store in Milvus or Pinecone).
- Add role-based auth for parties and auditors.
