/**
 * intelligenceService.js
 * Feature: AI
 * The 'Smart Brain' of Droid. Handles task processing, code generation, 
 * and context-aware transformations.
 */

const { appConfig } = require('../../config');
const fs = require('fs');
const path = require('path');

// Load dynamic vocabulary
let vocabulary = {};
try {
  const vocabPath = path.join(__dirname, '../../config/vocabulary.json');
  if (fs.existsSync(vocabPath)) {
    vocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
  }
} catch (e) {
  console.warn('Intelligence: Could not load vocabulary.json');
}

/**
 * Processes the user's spoken intent against the current system context.
 * Single-Pass Turbo Mode (v31.0):
 * Optimized for speed using In-Context Refinement.
 */
const processUserTask = async (rawTranscription) => {
  if (!rawTranscription || rawTranscription.length < 2) return '';

  // 1. Hallucination Filter (Common in tiny models)
  const hallucinations = ['thank you', 'subtitles by', 'thanks for watching', 'you', 'please subscribe'];
  if (hallucinations.includes(rawTranscription.toLowerCase().trim())) return '';

  // 2. Optimized Fast-Path: Only bypass AI for very simple 1-2 word casual confirmations
  // If there is ANY chance of technical jargon or needing symbols, we go to Groq.
  const casualWords = ['yes', 'no', 'okay', 'thanks', 'cool'];
  if (rawTranscription.split(' ').length < 3 && casualWords.includes(rawTranscription.toLowerCase().trim())) {
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
              content: appConfig.PROMPT_ENGINEERING.SYSTEM_PROMPT 
            },
            // Few-shot examples for CLEANUP, RESTARTS, and NO-AUGMENTATION
            { role: 'user', content: 'um i think that uh the api... wait i mean the groq api is fast' },
            { role: 'assistant', content: 'I think that the Groq API is fast.' },
            { role: 'user', content: 'give me a list of three fruit like apple banana and orange' },
            { role: 'assistant', content: 'Give me a list of 3 fruit:\n- Apple\n- Banana\n- Orange' },
            { role: 'user', content: 'what are some good courses for coding' },
            { role: 'assistant', content: 'What are some good courses for coding?' },
            { role: 'user', content: 'can you check the... actually delete the git repo' },
            { role: 'assistant', content: 'Delete the Git repo.' },
            { role: 'user', content: 'user at domain dot com and then hashtag coding' },
            { role: 'assistant', content: 'user@domain.com and then #coding' },
            { role: 'user', content: 'wow... that is amazing!' },
            { role: 'assistant', content: 'Wow... that is amazing!' },
            { 
              role: 'user', 
              content: `${appConfig.PROMPT_ENGINEERING.TASK_PROCESSOR_PROMPT}\n\n"${rawTranscription}"` 
            }
        ],
        temperature: 0, 
        max_tokens: 1000, 
      }),
    });

    if (!response.ok) {
        console.error('Intelligence: Groq API Error', response.status);
        return rawTranscription;
    }
    
    const data = await response.json();
    const result = data.choices[0].message.content.trim();
    
    // Safety check: if AI cleared everything but we had input, return the raw input
    return result || rawTranscription;
  } catch (err) {
    console.error('Intelligence Engine failed:', err);
    return rawTranscription;
  }
};

module.exports = {
    processUserTask
};
