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
 * Build comprehensive legal context prompt for Indian legal analysis
 * @param {Object} caseData - Complete case information
 * @param {string} caseData.caseId - Case identifier  
 * @param {Object} caseData.case - Case document with title and documents
 * @param {Array} caseData.arguments - All arguments in chronological order
 * @param {Array} caseData.previousDecisions - Previous AI decisions for context
 * @param {string} caseData.contextNote - Additional context
 * @param {string} caseData.requestType - 'initial', 'interim', or 'final'
 * @returns {string} Formatted legal prompt
 */
function buildLegalPrompt({ caseId, case: caseDoc, arguments: allArgs, previousDecisions = [], contextNote, requestType = 'initial' }) {
  const prompt = [];
  
  // Header with mock trial context
  prompt.push(`**MOCK TRIAL PROCEEDING - CASE ${caseId}**`);
  prompt.push(`**JURISDICTION: INDIAN LEGAL SYSTEM (with international law capability)**`);
  prompt.push(`**REQUEST TYPE: ${requestType.toUpperCase()} DECISION**\n`);
  
  // Case details
  prompt.push(`**CASE TITLE:** ${caseDoc.title}`);
  if (contextNote) prompt.push(`**SPECIAL INSTRUCTIONS:** ${contextNote}`);
  
  // Document evidence
  prompt.push(`\n**DOCUMENTARY EVIDENCE:**`);
  caseDoc.documents.forEach((doc, i) => {
    prompt.push(`\n**Document ${i + 1}** [Filed by: ${doc.side.toUpperCase()}]`);
    prompt.push(`Filename: ${doc.filename}`);
    prompt.push(`Content: ${doc.content.substring(0, 6000)}${doc.content.length > 6000 ? '\n[Content truncated for analysis]' : ''}`);
  });
  
  // Previous decisions context (for follow-up arguments)
  if (previousDecisions.length > 0) {
    prompt.push(`\n**PREVIOUS AI DECISIONS IN THIS CASE:**`);
    previousDecisions.forEach((decision, i) => {
      prompt.push(`\n**Decision ${i + 1}** [${decision.createdAt}]`);
      prompt.push(decision.text);
      prompt.push(`--- End of Decision ${i + 1} ---`);
    });
    prompt.push(`\n**NOTE:** Consider above previous decisions when analyzing new arguments.`);
  }
  
  // Arguments chronologically
  if (allArgs && allArgs.length) {
    prompt.push(`\n**ARGUMENTS PRESENTED (Chronological Order):**`);
    allArgs.forEach((arg, i) => {
      const argType = i < 2 ? 'INITIAL ARGUMENT' : 'COUNTER-ARGUMENT';
      prompt.push(`\n**${argType} ${i + 1}** [${arg.side.toUpperCase()}] - ${arg.createdAt}`);
      prompt.push(arg.text);
    });
  }
  
  // Analysis instructions
  prompt.push(`\n**ANALYSIS REQUIRED:**`);
  if (requestType === 'initial') {
    prompt.push(`Provide initial legal assessment based on documents and initial arguments.`);
  } else if (requestType === 'interim') {
    prompt.push(`Analyze new counter-arguments against previous decision. Determine if previous ruling should be modified, upheld, or if case requires further argument.`);
  } else {
    prompt.push(`Provide final judgment considering all evidence, arguments, and any previous interim decisions.`);
  }
  
  prompt.push(`\nApply Indian legal principles and cite relevant provisions/precedents where applicable.`);
  prompt.push(`For international elements, apply principles of private international law.`);
  prompt.push(`\n**END OF CASE MATERIALS**`);
  
  return prompt.join('\n');
}

/**
 * Request verdict generation from Groq LLM with Indian legal context
 * @param {Object} params - Request parameters
 * @param {string} params.caseId - Case identifier
 * @param {Object} params.case - Case document
 * @param {Array} params.arguments - Case arguments
 * @param {Array} params.previousDecisions - Previous decisions for context
 * @param {string} params.contextNote - Additional context
 * @param {string} params.requestType - Type of decision requested
 * @returns {Promise<{verdictText: string, raw: Object}>}
 */
async function requestVerdict({ caseId, case: caseDoc, arguments: allArgs, previousDecisions, contextNote, requestType = 'initial' }) {
  // Build comprehensive legal prompt with Indian context
  const prompt = buildLegalPrompt({ caseId, case: caseDoc, arguments: allArgs, previousDecisions, contextNote, requestType });
  
  // Defensive: return a mocked response if no API key set so local dev continues
  if (!GROQ_API_KEY) {
    return {
      verdictText: `**MOCK TRIAL VERDICT - CASE ${caseId}**\n**INDIAN LEGAL SYSTEM SIMULATION**\n\n**CASE SUMMARY:** (Groq API key not set - Development Mode)\n\n**JUDICIAL OPINION:** This is a simulated Indian legal proceeding for development purposes. The AI Judge trained on Indian case law and legal precedents would analyze the presented evidence and arguments according to Indian jurisprudence.\n\n**MOCK TRIAL DISCLAIMER:** This is an educational simulation. Please set GROQ_API_KEY environment variable to receive actual AI-generated legal analysis based on Indian legal training.\n\n**ORDER:** Development Mode Active\n**LEGAL BASIS:** API Configuration Required`,
      raw: { mocked: true, requestType, timestamp: new Date().toISOString() }
    };
  }

  try {
    console.time(`Groq Verdict Generation - Case ${caseId}`);
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Fast model for text-based legal analysis
      messages: [
        {
          role: "system",
          content: `You are an AI Judge trained on Indian legal system and case law precedents. You are conducting a MOCK TRIAL simulation that provides educational legal analysis.

**LEGAL JURISDICTION & TRAINING:**
- Primary expertise: Indian legal system, Constitution of India, Indian Penal Code, Civil Procedure Code
- Secondary capability: International law and comparative legal analysis for cross-border cases
- Training data: Indian Supreme Court judgments, High Court decisions, and established legal precedents

**YOUR ROLE:**
1. Analyze case documents and arguments through the lens of Indian jurisprudence
2. Apply relevant Indian legal principles, statutes, and case precedents
3. Consider constitutional provisions and fundamental rights (Articles 12-35)
4. Provide structured, well-reasoned verdicts following Indian court judgment format
5. Maintain judicial impartiality and consider evidence from both sides
6. For international cases: Apply principles of private international law and relevant treaties

**MOCK TRIAL CONTEXT:**
This is a simulated legal proceeding for educational purposes. Provide realistic legal analysis while clearly indicating this is a mock trial outcome.

**JUDGMENT FORMAT:**
- CASE DETAILS & PARTIES
- FACTS OF THE CASE
- ISSUES RAISED
- ARGUMENTS ANALYSIS (Plaintiff vs Defense)
- LEGAL PROVISIONS & PRECEDENTS APPLIED
- REASONING & JUDICIAL OPINION
- VERDICT/ORDER
- MOCK TRIAL DISCLAIMER

Maintain professional legal language consistent with Indian court judgments.`
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
