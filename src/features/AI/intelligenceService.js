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
const processUserTask = async (rawTranscription) => {
  if (!rawTranscription) return '';

  try {
    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appConfig.GROQ.API_KEY}`
    };

    const systemPrompt = appConfig.PROMPT_ENGINEERING.SYSTEM_PROMPT;
    const taskPrompt = appConfig.PROMPT_ENGINEERING.TASK_PROCESSOR_PROMPT;
    
    // Construct a focused user message
    const userMessage = `${taskPrompt} ${rawTranscription}`;

    const response = await fetch(appConfig.GROQ.URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: appConfig.GROQ.MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        temperature: 0.1,
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
