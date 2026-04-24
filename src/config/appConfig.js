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
    ADB_PATH: 'adb', // Assuming in PATH
    DEVICE_IP: process.env.DEVICE_IP || '', // IP of your Android device for WiFi fallback
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
    MODEL_SIZE: 'tiny', // Reverted to local model
    DEVICE: 'cpu', // Will be auto-upgraded in backend if CUDA found
    TRANSCRIPTION_TIMEOUT: 1200000, // 20 minutes (allows for model download)
  },

  // OS Integration
  TYPING: {
    MODE: 'clipboard', // 'type' or 'clipboard'
    COMMAND: 'xdotool type --delay 5',
    PASTE_MODIFIER: 'ctrl+v',
  },

  // AI & Prompt Engineering (using Groq)
  GROQ: {
    URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    API_KEY: process.env.GROQ_API_KEY,
  },

  PROMPT_ENGINEERING: {
    /**
     * Droid High-Fidelity Intelligence (v34.0 - Strict Literal + Smart Formatting)
     */
    SYSTEM_PROMPT: `You are WhisperFlow Intelligence, a high-fidelity transcription and formatting engine.
Your goal is to transcribe the user's speech WITH 100% VERBATIM ACCURACY while applying professional formatting.

STRICT TRANSCRIPTION RULES:
1. 100% VERBATIM: Do NOT remove any words, fillers (um, uh, like), or stutters. Transcribe exactly what was said.
2. NO SUMMARIZATION: Do not shorten, summarize, or "clean up" the content. Every spoken word must be present in the output.
3. SMART FORMATTING: Apply proper punctuation (commas, periods, question marks) and capitalization to make the text readable and professional.
4. PARAGRAPHING: Break the text into logical paragraphs if the input is long.
5. NO EXPLANATIONS: Output ONLY the final transcribed and formatted text. Do not provide meta-commentary.

STRICT RULES:
- Output ONLY the result.
- No preamble or post-amble.
- Preserve EVERY SINGLE WORD the user spoke.`,

    // The "Turbo" Single-Pass prompt
    TASK_PROCESSOR_PROMPT: "Transcribe and format the following raw input strictly verbatim: ",
    CONTEXT: ''
  }
};

module.exports = config;
