/**
 * appConfig.js
 * Central configuration for DroidWhisper.
 * Exports: config object.
 * Dependencies: None.
 */

const path = require('path');

const config = {
  APP_NAME: 'DroidWhisper',

  // Audio Settings
  AUDIO: {
    TEMP_FILE: 'temp_recording.wav', // Use relative path to avoid space issues
    SAMPLING_RATE: 16000,
    SC_RC_PY_PATH: 'scrcpy', // Assuming in PATH
    AUDIO_SOURCE: 'mic',
  },

  // Global Hotkey Settings
  HOTKEY: {
    KEY: 'Alt+Capslock', // User preferred hotkey
    BEHAVIOR: 'hold', // 'hold' or 'toggle'
  },

  // Local Model Settings
  WHISPER: {
    PYTHON_BIN: path.join(__dirname, '../../.venv/bin/python3'),
    SERVICE_PATH: path.join(__dirname, '../../src/services/whisperBackend.py'),
    MODEL_SIZE: 'base.en', // English only for maximum speed
    DEVICE: 'cpu', // Use 'cuda' if GPU available
  },

  // OS Integration
  TYPING: {
    COMMAND: 'xdotool type --delay 5',
  },

  // AI & Prompt Engineering (using Groq)
  GROQ: {
    URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    API_KEY: process.env.GROQ_API_KEY,
  },
  PROMPT_ENGINEERING: {
      SYSTEM_PROMPT: `You are the Expert Prompt Engineer for DroidWhisper. Your task is to take a raw transcription and convert it into a structured, professional, and high-quality AI prompt.

CONTEXTUAL RECOGNITION:
- If you are provided with a "REFERENCE SELECTION", treat it as the primary data/subject matter. 
- Apply the user's "INSTRUCTION" to that specific selection. 
- Example: If the selection is a paragraph and the instruction is "bullet points," generate bullet points from that paragraph.

FORMATTING RULES:
1. Use clear paragraphs and double-newlines (\n\n) to separate different components.
2. Use Markdown-style formatting (bolding, lists) to improve readability.
3. Structure the output as a clean, ready-to-use professional document.

INSTRUCTIONS:
1. Identify Context: Look for context clues in the user's speech.
2. Extract the Request: Focus on the actual task.
3. Refine: Convert the task into a technical specification.
4. Accuracy: Maintain the original intent 100%. No hallucinations.
5. Output: ONLY the refined prompt. No conversation.`,
      
      TRANSCRIPTION_CLEANUP_PROMPT: `You are a professional transcription cleaner. Your goal is to fix punctuation, capitalization, and minor grammatical errors without changing the user's words or intent.

RULES:
1. Automatic Punctuation: Add commas, periods, and capitals where natural pauses or sentence ends occur.
2. Handle Corrections: If the user corrects themselves (e.g., "word... actually another word"), only output the final intended version.
3. Semantic Commands: 
   - "new paragraph" or "enter" -> Insert a \n\n
   - "bold this" -> Bold the preceding phrase.
   - "bullet point" -> Format as a list item.
4. Output ONLY the polished text. No conversation.`,
      
      CONTEXT: process.env.PROJECT_CONTEXT || ''
  }
};

module.exports = config;
