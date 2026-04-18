/**
 * promptService.js
 * Interfaces with Ollama to refine raw transcriptions into professional prompts.
 */

const { appConfig } = require('../../config');

/**
 * Sends raw text to Ollama for professional rephrasing.
 * @param {string} rawText - The raw transcribed text.
 * @returns {Promise<string>} The professionally refined prompt.
 */
const refinePrompt = async (rawText) => {
  if (!rawText || rawText.length < 5) return rawText;

  console.log(`Sending to Ollama Cloud (${appConfig.OLLAMA.MODEL})...`);

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (appConfig.OLLAMA.API_KEY) {
        headers['Authorization'] = `Bearer ${appConfig.OLLAMA.API_KEY}`;
    }

    const response = await fetch(appConfig.OLLAMA.URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: appConfig.OLLAMA.MODEL,
        messages: [
            { role: 'user', content: `${appConfig.PROMPT_ENGINEERING.SYSTEM_PROMPT}\n\nTRANSCRIPTION: "${rawText}"` }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`Ollama Cloud error: ${response.status} ${errData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.message.content.trim();
  } catch (err) {
    console.error('Prompt Engineering failed:', err);
    return rawText; // Fallback to raw text if AI fails
  }
};

module.exports = {
  refinePrompt,
};
