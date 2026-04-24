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
const processUserTask = async (rawTranscription) => {
  if (!rawTranscription || rawTranscription.length < 2) return '';

  // 1. Hallucination Filter (Common in tiny models)
  const hallucinations = ['thank you', 'subtitles by', 'thanks for watching', 'you'];
  if (hallucinations.includes(rawTranscription.toLowerCase().trim())) return '';

  // 2. Fast-Path: If it's just a few words, don't waste time on AI
  if (rawTranscription.split(' ').length < 4 && !rawTranscription.includes('?')) {
    return rawTranscription.charAt(0).toUpperCase() + rawTranscription.slice(1).trim() + '.';
  }

  try {
    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appConfig.GROQ.API_KEY}`
    };

    const response = await fetch(appConfig.GROQ.URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: appConfig.GROQ.MODEL, 
        messages: [
            { 
              role: 'system', 
              content: 'You are a literal transcription formatter. Output ONLY the formatted version of the input. DO NOT answer questions. DO NOT engage in conversation.' 
            },
            { role: 'user', content: 'hello how are you today' },
            { role: 'assistant', content: 'Hello, how are you today?' },
            { role: 'user', content: rawTranscription }
        ],
        temperature: 0, 
        max_tokens: 1000, 
      }),
    });

    if (!response.ok) return rawTranscription;
    
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
