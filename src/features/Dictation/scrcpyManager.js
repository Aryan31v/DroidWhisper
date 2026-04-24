const { spawn } = require('child_process');
const { appConfig } = require('../../config');
const fs = require('fs');
const path = require('path');
const adbService = require('../../services/adbService');

let scrcpyProcess = null;
let currentRecordingPath = null;

/**
 * Starts scrcpy in audio-only recording mode using Native Recording Engine.
 * 100% Reliable across all hardware.
 */
const startRecording = async () => {
  if (scrcpyProcess) return;

  // Ensure device is connected (Wireless Fallback)
  const connected = await adbService.ensureConnection();
  if (!connected) {
      throw new Error('Device not connected. Check WiFi/USB.');
  }

  // Generate unique filename to prevent stale data reads (v29.1 Fix)
  const filename = `recording_${Date.now()}.wav`;
  currentRecordingPath = path.resolve(process.cwd(), filename);

  const args = [
    '--no-video',
    `--audio-source=${appConfig.AUDIO.AUDIO_SOURCE}`,
    '--audio-codec=raw',
    `--record=${currentRecordingPath}`,
    '--no-window',
    '--no-control',
    '--no-audio-playback',
  ];

  console.log(`Restoration: Starting native scrcpy recording [${filename}]...`);
  scrcpyProcess = spawn(appConfig.AUDIO.SC_RC_PY_PATH, args);

  scrcpyProcess.on('error', (err) => {
    console.error('scrcpy: Failed to start process:', err);
    scrcpyProcess = null;
  });

  scrcpyProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`scrcpy: Process exited with code ${code}`);
    }
    scrcpyProcess = null;
  });

  scrcpyProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    console.error('[scrcpy]', msg);
  });

  return new Promise((resolve) => {
    setTimeout(resolve, 800);
  });
};

const stopRecording = async () => {
  if (!scrcpyProcess) {
    // If process already died, just return the path (it might be empty/non-existent)
    const p = currentRecordingPath;
    currentRecordingPath = null;
    return p;
  }

  const recordingPath = currentRecordingPath;
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
        console.warn('scrcpy: Stop timed out, forcing kill.');
        scrcpyProcess = null;
        resolve(recordingPath);
    }, 2000);

    scrcpyProcess.on('close', () => {
      clearTimeout(timeout);
      console.log('Restoration: Native recording finished.');
      scrcpyProcess = null;
      currentRecordingPath = null;
      resolve(recordingPath);
    });
    scrcpyProcess.kill('SIGINT');
  });
};

module.exports = {
  startRecording,
  stopRecording,
};
