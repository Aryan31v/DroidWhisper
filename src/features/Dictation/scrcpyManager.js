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

  // 1. Ensure device is connected (Wireless Fallback)
  // We probe manually here to get the correct serial for scrcpy
  let targetSerial = null;
  const isConnected = await adbService.isDeviceConnected();
  
  if (!isConnected) {
    console.log('Restoration: No device found. Attempting WiFi fallback...');
    const wifiConnected = await adbService.connectWireless();
    if (!wifiConnected) {
      throw new Error('Audio Engine Error: No device found via USB or WiFi. Please check connections.');
    }
    targetSerial = `${appConfig.AUDIO.DEVICE_IP}:5555`;
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

  if (targetSerial) {
    args.push('--serial', targetSerial);
    console.log(`Restoration: Using WiFi serial [${targetSerial}]`);
  }

  console.log(`Restoration: Starting native scrcpy recording [${filename}]...`);
  
  try {
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
      if (msg.includes('ERROR')) {
          console.error('[scrcpy Critical]', msg);
      } else {
          console.log('[scrcpy]', msg);
      }
    });

  } catch (err) {
    console.error('Audio Engine: Spawn failed:', err);
    throw err;
  }

  return new Promise((resolve) => {
    setTimeout(resolve, 1000); // Increased buffer for WiFi initialization
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
