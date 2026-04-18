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
  }
};

module.exports = config;
