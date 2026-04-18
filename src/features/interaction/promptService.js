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

  console.log(`Sending to Groq (${appConfig.GROQ.MODEL}) for professional processing...`);

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
            { role: 'system', content: appConfig.PROMPT_ENGINEERING.SYSTEM_PROMPT },
            { role: 'user', content: rawText }
        ],
        temperature: 0.5,
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

module.exports = {
  refinePrompt,
};
