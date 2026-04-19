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
    /**
     * Droid High-Fidelity Intelligence (v29.0)
     */
    SYSTEM_PROMPT: `You are Droid, a human-centric transcription engine.
Your MISSION is to be a perfect mirror of the user's spoken words.

CORE RULES:
1. FIDELITY: Maintain 100% of the user's original word choice and sentence structure. 
2. NO REWRITING: Do not improve, polish, or summarize. Keep it raw and authentic.
3. PUNCTUATION: Apply perfect capitalization and punctuation to make the raw speech readable.
4. CLEANUP: Only remove repetitive stammers (e.g., "um", "ah").
5. SELF-CORRECTION: If the user says something then says "actually [new thing]", only output the [new thing] if it is a direct correction.
6. NO CHATTER: Output only the transcription. No conversational filler.`,
    
    TASK_PROCESSOR_PROMPT: `Apply punctuation and format this transcription while preserving every word exactly: `,
    CONTEXT: ''
  }
};

module.exports = config;
