const { spawn } = require('child_process');
const { appConfig } = require('../../config');
const fs = require('fs');
const path = require('path');

let scrcpyProcess = null;

/**
 * Starts scrcpy in audio-only recording mode using Native Recording Engine.
 * 100% Reliable across all hardware.
 */
const startRecording = async () => {
  if (scrcpyProcess) return;

  const absolutePath = path.resolve(process.cwd(), appConfig.AUDIO.TEMP_FILE);
  if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);

  const args = [
    '--no-video',
    `--audio-source=${appConfig.AUDIO.AUDIO_SOURCE}`,
    '--audio-codec=raw',
    `--record=${absolutePath}`,
    '--no-window',
    '--no-control',
    '--no-audio-playback',
  ];

  console.log('Restoration: Starting native scrcpy recording...', args.join(' '));
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

  const absolutePath = path.resolve(process.cwd(), appConfig.AUDIO.TEMP_FILE);
  return new Promise((resolve) => {
    scrcpyProcess.on('close', () => {
      console.log('Restoration: Native recording finished.');
      scrcpyProcess = null;
      resolve(absolutePath);
    });
    scrcpyProcess.kill('SIGINT');
  });
};

module.exports = {
  startRecording,
  stopRecording,
};
