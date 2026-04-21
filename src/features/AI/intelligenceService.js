/**
 * intelligenceService.js
 * Feature: AI
 * The 'Smart Brain' of Droid. Handles task processing, code generation, 
 * and context-aware transformations.
 */

const { appConfig } = require('../../config');

/**
 * Processes the user's spoken intent against the current system context.
 */
/**
 * Processes the user's spoken intent against the current system context.
 * Single-Pass Turbo Mode (v31.0):
 * Optimized for speed using In-Context Refinement.
 */
const processUserTask = async (rawTranscription, intent = 'dictate') => {
  if (!rawTranscription) return '';

  try {
    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appConfig.GROQ.API_KEY}`
    };

    const systemPrompt = appConfig.PROMPT_ENGINEERING.SYSTEM_PROMPT;
    const taskPrompt = `${appConfig.PROMPT_ENGINEERING.TASK_PROCESSOR_PROMPT} [MODE: ${intent.toUpperCase()}]`;

    // Speed Optimization: Use faster model (8B) for simple dictation tasks without special triggers
    const isSimpleDictation = intent === 'dictate' && !rawTranscription.toLowerCase().includes('droid');
    const model = isSimpleDictation ? 'llama-3.1-8b-instant' : appConfig.GROQ.MODEL;

    const response = await fetch(appConfig.GROQ.URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: model, 
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${taskPrompt}\n\nRAW INPUT: ${rawTranscription}` }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
        console.error(`AI Error: ${response.status}`);
        return rawTranscription;
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error('Intelligence Engine failed:', err);
    return rawTranscription;
  }
};

module.exports = {
    processUserTask
};
