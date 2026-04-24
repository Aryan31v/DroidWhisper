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
const fs = require('fs');

let whisperProcess = null;
let resolvePromise = null;
let transcriptionTimeout = null;

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
        if (app.onWhisperEvent) {
          app.onWhisperEvent('service_ready');
        }
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
    // 1. Guard: Check if file exists and is readable
    try {
        if (!fs.existsSync(audioPath)) {
            console.warn('Bridge: Audio file does not exist.');
            resolve({ text: '', error: 'missing' });
            return;
        }
        const stats = fs.statSync(audioPath);
        if (stats.size < 1000) { // Less than ~1KB
            console.log('Bridge: Audio file too small, skipping transcription.');
            resolve({ text: '', info: 'empty' });
            return;
        }
    } catch (e) {
        console.error('Bridge: Could not access audio file:', e);
        resolve({ text: '', error: 'access_denied' });
        return;
    }

    // 2. Set safety timeout (20s)
    if (transcriptionTimeout) clearTimeout(transcriptionTimeout);
    transcriptionTimeout = setTimeout(() => {
        if (resolvePromise) {
            console.warn('Bridge: Transcription TIMEOUT reached.');
            resolve({ error: 'Timeout' });
            resolvePromise = null;
        }
    }, appConfig.WHISPER.TRANSCRIPTION_TIMEOUT);

    resolvePromise = (res) => {
        if (transcriptionTimeout) clearTimeout(transcriptionTimeout);
        resolve(res);
    };

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
