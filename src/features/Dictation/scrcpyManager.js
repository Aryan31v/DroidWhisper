const { spawn } = require('child_process');
const { appConfig } = require('../../config');
const fs = require('fs');
const path = require('path');

let scrcpyProcess = null;
let currentRecordingPath = null;

/**
 * Starts scrcpy in audio-only recording mode using Native Recording Engine.
 * 100% Reliable across all hardware.
 */
const startRecording = async () => {
  if (scrcpyProcess) return;

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

  scrcpyProcess.stderr.on('data', (data) => {
    console.error('[scrcpy]', data.toString().trim());
  });

  return new Promise((resolve) => {
    setTimeout(resolve, 800);
  });
};

const stopRecording = async () => {
  if (!scrcpyProcess) return null;

  const recordingPath = currentRecordingPath;
  
  return new Promise((resolve) => {
    scrcpyProcess.on('close', () => {
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
