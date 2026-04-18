/**
 * promptService.js
 * Interfaces with Ollama to refine raw transcriptions into professional prompts.
 */

const { appConfig } = require('../../config');

/**
 * Sends raw text to Ollama for professional rephrasing.
 * @param {string} rawText - The raw transcribed text.
 * @param {string} referenceText - Optional text highlighted by the user for context.
 * @param {Object} appContext - { app, title }
 * @returns {Promise<string>} The professionally refined prompt.
 */
const refinePrompt = async (rawText, referenceText = '', appContext = { app: 'Unknown', title: 'Unknown' }) => {
  if (!rawText) return '';

  console.log(`Processing with App Context: ${appContext.app} | Selection: ${!!referenceText}`);

  try {
    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appConfig.GROQ.API_KEY}`
    };

    // Inject App Context into System Prompt
    const systemPrompt = appConfig.PROMPT_ENGINEERING.SYSTEM_PROMPT
        .replace(/{{APP_NAME}}/g, appContext.app)
        .replace(/{{WINDOW_TITLE}}/g, appContext.title);

    const userMessage = referenceText 
        ? `REFERENCE SELECTION:\n"""\n${referenceText}\n"""\n\nINSTRUCTION: ${rawText}`
        : (appConfig.PROMPT_ENGINEERING.CONTEXT 
            ? `PROJECT CONTEXT: ${appConfig.PROMPT_ENGINEERING.CONTEXT}\n\nTRANSCRIPTION: ${rawText}`
            : rawText);

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
        const errData = await response.json().catch(() => ({}));
        throw new Error(`Groq API error: ${response.status} ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error('Groq Prompt Engineering failed:', err);
    return rawText;
  }
};

/**
 * Polishes raw transcription without rephrasing (Smart Flow).
 * Fixes punctuation, capitalization, and formatting.
 * @param {string} rawText - The raw transcribed text.
 * @param {string} referenceText - Optional text highlighted by the user for context.
 * @param {Object} appContext - { app, title }
 * @returns {Promise<string>} The polished text.
 */
const cleanTranscription = async (rawText, referenceText = '', appContext = { app: 'Unknown', title: 'Unknown' }) => {
  if (!rawText) return '';

  console.log('Polishing transcription using App-Aware Smart Flow...');

  try {
    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appConfig.GROQ.API_KEY}`
    };

    // Inject App Context into System Prompt
    const systemPrompt = appConfig.PROMPT_ENGINEERING.TRANSCRIPTION_CLEANUP_PROMPT
        .replace(/{{APP_NAME}}/g, appContext.app)
        .replace(/{{WINDOW_TITLE}}/g, appContext.title);

    const userMessage = referenceText
        ? `REFERENCE SELECTION:\n"""\n${referenceText}\n"""\n\nINSTRUCTION: ${rawText}`
        : rawText;

    const response = await fetch(appConfig.GROQ.URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: appConfig.GROQ.MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        temperature: 0.0, // Maximum literal accuracy
      }),
    });

    if (!response.ok) return rawText;

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error('Smart Flow Cleanup failed:', err);
    return rawText;
  }
};

module.exports = {
  refinePrompt,
  cleanTranscription,
};
