const { spawn } = require('child_process');
const { appConfig } = require('../../config');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class ScrcpyManager extends EventEmitter {
  constructor() {
    super();
    this.scrcpyProcess = null;
    this.fileStream = null;
  }

  /**
   * Starts scrcpy in audio-only recording mode.
   * Outputs raw PCM to stdout for analysis.
   */
  async startRecording() {
    if (this.scrcpyProcess) return;

    const absolutePath = path.resolve(process.cwd(), appConfig.AUDIO.TEMP_FILE);
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);

    // Write to a file manually while piping for analysis
    this.fileStream = fs.createWriteStream(absolutePath);

    const args = [
      '--no-video',
      `--audio-source=${appConfig.AUDIO.AUDIO_SOURCE}`,
      '--audio-codec=raw',
      '--audio-output-format=raw', // New: raw PCM to stdout
      '--no-window',
      '--no-control',
      '--no-audio-playback',
      '-', // Output to stdout
    ];

    console.log('Starting scrcpy audio analysis stream...');
    this.scrcpyProcess = spawn(appConfig.AUDIO.SC_RC_PY_PATH, args);

    this.scrcpyProcess.stdout.on('data', (chunk) => {
      // 1. Save to file for Whisper
      if (this.fileStream) this.fileStream.write(chunk);

      // 2. Calculate RMS (Volume) for UI Waveform
      // Raw PCM 16-bit LE (scrcpy default)
      let sum = 0;
      for (let i = 0; i < chunk.length; i += 2) {
        if (i + 1 >= chunk.length) break;
        const sample = chunk.readInt16LE(i);
        sum += sample * sample;
      }
      const rms = Math.sqrt(sum / (chunk.length / 2));
      const level = Math.min(rms / 32768, 1); // Normalize to 0-1
      
      this.emit('audio-level', level);
    });

    this.scrcpyProcess.stderr.on('data', (data) => {
      console.error('[scrcpy]', data.toString().trim());
    });

    return new Promise((resolve) => {
      setTimeout(resolve, 800);
    });
  }

  async stopRecording() {
    if (!this.scrcpyProcess) return null;

    return new Promise((resolve) => {
      this.scrcpyProcess.on('close', () => {
        if (this.fileStream) this.fileStream.end();
        this.scrcpyProcess = null;
        resolve(path.resolve(process.cwd(), appConfig.AUDIO.TEMP_FILE));
      });
      this.scrcpyProcess.kill('SIGINT');
    });
  }
}

module.exports = new ScrcpyManager();
