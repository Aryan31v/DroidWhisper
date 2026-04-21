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
    MODEL_SIZE: 'tiny', // Absolute fastest model for old hardware
    DEVICE: 'cpu', // Will be auto-upgraded in backend if CUDA found
    TRANSCRIPTION_TIMEOUT: 1200000, // 2 minutes (up from 20s)
  },

  // OS Integration
  TYPING: {
    COMMAND: 'xdotool type --delay 5',
    PASTE_MODIFIER: 'ctrl+v',
  },

  // AI & Prompt Engineering (using Groq)
  GROQ: {
    URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    API_KEY: process.env.GROQ_API_KEY,
  },

  PROMPT_ENGINEERING: {
    /**
     * Droid High-Fidelity Intelligence (v31.0 - Turbo)
     */
    SYSTEM_PROMPT: `You are Droid Intel, a precision-focused transcription engine.
Your sole purpose is to clean up raw audio transcriptions into high-quality text based on the requested [MODE].

STRICT RULES:
1. Output ONLY the refined text. 
2. ABSOLUTELY NO CHATTER. Do not explain what you did. Do not narrate your process.
3. NO PREAMBLE. Do not say "The refined output is" or "Here is the cleaned text".
4. If the input is the user telling you to do something, simply execute it and output the result.

MODES:
- DICTATE: Clean up stutters and filler words while remaining 100% faithful to the original intent.
- FLOW: Rephrase rambling thoughts into professional, eloquent communication.
- CRAFT: Structure the data into lists, summaries, or specific formats.`,

    // The "Turbo" Single-Pass prompt
    TASK_PROCESSOR_PROMPT: "Transform the following RAW INPUT using MODE: ",
    CONTEXT: ''
  }
};

module.exports = config;
