const axios = require('axios');

/**
 * Groq client wrapper - lightweight stub.
 * Replace the call/URL with the official Groq SDK or endpoint and pass the API key in env.
 * Exports: requestVerdict({ caseId, prompt }) -> { verdictText, raw }
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.ai/v1/llm'; // placeholder

async function requestVerdict({ caseId, prompt }) {
  // Defensive: return a mocked response if no API key set so local dev continues
  if (!GROQ_API_KEY) {
    return {
      verdictText: `MOCK VERDICT for case ${caseId}: (Groq API key not set)\nSummary: Please set GROQ_API_KEY to get real verdicts.`,
      raw: { mocked: true }
    };
  }

  try {
    // Example HTTP POST - adapt to Groq's official spec or SDK
    const resp = await axios.post(GROQ_API_URL, {
      model: 'groq-1',
      input: prompt,
      max_tokens: 800
    }, {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` }
    });

    // This mapping depends on the actual Groq response structure
    const verdictText = resp.data?.output?.[0] || JSON.stringify(resp.data);
    return { verdictText, raw: resp.data };
  } catch (err) {
    console.error('Groq request error:', err?.response?.data || err.message);
    return { verdictText: `ERROR: Groq request failed: ${err.message}`, raw: { error: err.message } };
  }
}

module.exports = { requestVerdict };
