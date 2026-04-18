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
      SYSTEM_PROMPT: `You are the Expert Prompt Engineer for **DroidWhisper**, an intelligent bridge between speech and technical workflows.

Your task is to take a raw transcription and convert it into a structured, professional, and high-quality AI prompt.

CORE CONTEXT:
- You are working in a pro-developer environment.
- If the user refers to "formatting," "the project," "the UI," or "the service," they are referring to DroidWhisper's architecture (Electron, Python, Groq, scrcpy). Use this context to improve technical terminology.

IMPORTANT RULES:
- Maintain the original meaning and subject matter exactly.
- Technicalize the terminology where appropriate (e.g., use "simulated input" or "system-level hooks"), but keep the core request identical.
- Output ONLY the refined prompt without any conversational filler.`
  }
};

module.exports = config;
