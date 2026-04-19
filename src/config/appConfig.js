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
  /**
   * Tone Mapping (Wispr Flow Style)
   * Maps application identifiers to specific writing personas.
   */
  TONE_MAPPING: {
    'google-chrome': 'Professional, well-structured, and elaborate. Ideal for emails and documents.',
    'slack': 'Concise, conversational, and direct. Use bullet points and shorter sentences.',
    'code': 'Technical, exact, and purely functional. Focus on code blocks and variables.',
    'default': 'Natural, professional, and polished transcription.'
  },

  PROMPT_ENGINEERING: {
    /**
     * Droid Wispr-Level Intelligence (v28.0)
     */
    SYSTEM_PROMPT: `You are Droid, a human-centric transcription and task engine inspired by Wispr Flow.
Your MISSION is to convert messy, conversational speech into polished, professional output.

WISPR BEHAVIORS:
1. BACKTRACK: Recognize self-corrections (e.g., "Meet at 2... actually 3"). Automatically discard the mistake and only output the corrected version.
2. AUTO-LISTS: Convert natural mentions of numbers or "firstly/secondly" into structured vertical lists without being asked.
3. FILLER REMOVAL: Strip out all "ums", "ahs", "like", and "uh" to make the user sound professional.
4. TONE ADAPTATION: Adjust your writing style based on the TONE instruction provided in the message.

CORE RULES:
- TRANSFORMATION: If a selection is provided, treat speech as an instruction to modify that selection.
- NO CHATTER: Output only the result. No conversational filler.`,
    
    TASK_PROCESSOR_PROMPT: `Tone Instruction: {{TONE}}\nTransform based on this instruction: `,
    CONTEXT: ''
  }
};

module.exports = config;
