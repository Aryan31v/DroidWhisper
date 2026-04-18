/**
 * scrcpyManager.js
 * Manages the scrcpy process to capture audio from the Android device.
 * Exports: startRecording, stopRecording functions.
 * Dependencies: child_process.
 * Used by: main.js or hotkeyManager.
 */

const { spawn } = require('child_process');
const { appConfig } = require('../../config');
const fs = require('fs');
const path = require('path');

let scrcpyProcess = null;

/**
 * Starts scrcpy in audio-only recording mode.
 * @returns {Promise<void>}
 */
const startRecording = async () => {
  if (scrcpyProcess) {
    console.warn('scrcpy is already running.');
    return;
  }

  // Ensure any existing temp file is removed
  const absolutePath = path.resolve(process.cwd(), appConfig.AUDIO.TEMP_FILE);
  if (fs.existsSync(absolutePath)) {
    try {
      fs.unlinkSync(absolutePath);
    } catch (err) {
      console.error('Failed to remove old temp file:', err);
    }
  }

  const args = [
    '--no-video',
    `--audio-source=${appConfig.AUDIO.AUDIO_SOURCE}`,
    '--audio-codec=raw',
    `--record=${absolutePath}`,
    '--no-window',
    '--no-control',
    '--no-audio-playback',
  ];

  console.log('Starting scrcpy recording...', args.join(' '));
  
  scrcpyProcess = spawn(appConfig.AUDIO.SC_RC_PY_PATH, args);

  scrcpyProcess.stdout.on('data', (data) => {
    console.log('[scrcpy stdout]', data.toString().trim());
  });

  scrcpyProcess.stderr.on('data', (data) => {
    console.error('[scrcpy stderr]', data.toString().trim());
  });

  scrcpyProcess.on('error', (err) => {
    console.error('Failed to start scrcpy:', err);
    scrcpyProcess = null;
  });

  return new Promise((resolve, reject) => {
    // We give it a small head start to initialize
    setTimeout(resolve, 500);
  });
};

/**
 * Stops the scrcpy process, saving the recording.
 * @returns {Promise<string>} Path to the recorded file.
 */
const stopRecording = async () => {
  if (!scrcpyProcess) {
    console.warn('scrcpy was not running.');
    return null;
  }

  console.log('Stopping scrcpy...');
  
  const absolutePath = path.resolve(process.cwd(), appConfig.AUDIO.TEMP_FILE);
  return new Promise((resolve) => {
    scrcpyProcess.on('close', () => {
      console.log('scrcpy recording finished.');
      scrcpyProcess = null;
      resolve(absolutePath);
    });

    // Send SIGINT to stop recording cleanly
    scrcpyProcess.kill('SIGINT');
  });
};

module.exports = {
  startRecording,
  stopRecording,
};
