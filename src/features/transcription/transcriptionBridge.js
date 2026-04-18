/**
 * transcriptionBridge.js
 * Handles communication with the local Python Whisper service.
 * Exports: transcribe function, startService, stopService.
 * Dependencies: child_process, appConfig.
 * Used by: main.js.
 */

const { spawn } = require('child_process');
const { app } = require('electron');
const { appConfig } = require('../../config');

let whisperProcess = null;
let resolvePromise = null;

/**
 * Starts the Python Whisper service.
 */
const startService = () => {
  if (whisperProcess) return;

  console.log('Starting Whisper Python service...');
  
  whisperProcess = spawn(appConfig.WHISPER.PYTHON_BIN, [appConfig.WHISPER.SERVICE_PATH], {
    env: {
      ...process.env,
      WHISPER_MODEL: appConfig.WHISPER.MODEL_SIZE,
      WHISPER_DEVICE: appConfig.WHISPER.DEVICE,
      PYTHONUNBUFFERED: '1',
    }
  });

  whisperProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    
    for (const line of lines) {
      const output = line.trim();
      if (!output) continue;
      
      console.log('Whisper Service:', output);

      if (output === 'READY') {
        console.log('Whisper service is ready.');
        continue;
      }

      try {
        const result = JSON.parse(output);
        
        // Handle events (like hotkey triggers)
        if (result.event) {
          if (app.onWhisperEvent) {
            app.onWhisperEvent(result.event);
          }
          continue;
        }

        // Handle transcription results
        if (resolvePromise) {
          resolvePromise(result);
          resolvePromise = null;
        }
      } catch (e) {
        // Partial or malformed JSON
      }
    }
  });

  whisperProcess.stderr.on('data', (data) => {
    console.error('Whisper Service Error:', data.toString());
  });

  whisperProcess.on('close', () => {
    whisperProcess = null;
    console.log('Whisper service stopped.');
  });
};

/**
 * Transcribes an audio file.
 * @param {string} audioPath - Path to the wav file.
 * @returns {Promise<Object>} The transcription result.
 */
const transcribe = (audioPath) => {
  if (!whisperProcess) {
    throw new Error('Whisper service is not running.');
  }

  return new Promise((resolve) => {
    resolvePromise = resolve;
    whisperProcess.stdin.write(audioPath + '\n');
  });
};

/**
 * Stops the Whisper service.
 */
const stopService = () => {
  if (whisperProcess) {
    whisperProcess.kill();
    whisperProcess = null;
  }
};

module.exports = {
  startService,
  transcribe,
  stopService,
};
