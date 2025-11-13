const Groq = require('groq-sdk');

/**
 * Groq client using official SDK for JurisAI verdict generation
 * Handles legal case analysis and verdict generation using Groq's LLM
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Initialize Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

/**
 * Request verdict generation from Groq LLM
 * @param {Object} params - Request parameters
 * @param {string} params.caseId - Case identifier
 * @param {string} params.prompt - Full case prompt for analysis
 * @returns {Promise<{verdictText: string, raw: Object}>}
 */
async function requestVerdict({ caseId, prompt }) {
  // Defensive: return a mocked response if no API key set so local dev continues
  if (!GROQ_API_KEY) {
    return {
      verdictText: `MOCK VERDICT for case ${caseId}:\n\nSUMMARY: (Groq API key not set)\n\nBased on the available evidence, this is a simulated verdict for development purposes. Please set GROQ_API_KEY environment variable to receive actual AI-generated verdicts.\n\nDISPOSITION: Development Mode\nREASONING: API key required for live analysis`,
      raw: { mocked: true }
    };
  }

  try {
    console.time(`Groq Verdict Generation - Case ${caseId}`);
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Fast model for text-based legal analysis
      messages: [
        {
          role: "system",
          content: `You are an AI Judge with expertise in legal analysis and case law. Your task is to:

1. Analyze case documents and arguments objectively
2. Apply relevant legal principles and precedents
3. Provide a structured, well-reasoned verdict
4. Be impartial and consider evidence from both sides

Format your response as a formal legal verdict with:
- CASE SUMMARY
- KEY EVIDENCE ANALYSIS  
- LEGAL REASONING
- VERDICT/DISPOSITION
- RATIONALE

Keep the verdict professional, clear, and legally sound.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent legal reasoning
      max_tokens: 1024,  // Allow for detailed legal analysis
      top_p: 0.9
    });

    const verdictText = completion.choices?.[0]?.message?.content;

    if (!verdictText) {
      throw new Error("No response generated from Groq model");
    }

    console.timeEnd(`Groq Verdict Generation - Case ${caseId}`);
    console.log(`Groq Usage - Model: llama-3.3-70b-versatile, Tokens: ~${verdictText.length/4}`);

    return { 
      verdictText, 
      raw: {
        model: completion.model,
        usage: completion.usage,
        finishReason: completion.choices?.[0]?.finish_reason,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('Groq request error:', error?.message || error);
    
    // Provide a meaningful error response
    return { 
      verdictText: `ERROR GENERATING VERDICT for case ${caseId}:\n\nAn error occurred while processing your request: ${error.message}\n\nPlease check your Groq API configuration and try again.`, 
      raw: { 
        error: error.message,
        timestamp: new Date().toISOString(),
        caseId 
      } 
    };
  }
}

module.exports = { requestVerdict };
