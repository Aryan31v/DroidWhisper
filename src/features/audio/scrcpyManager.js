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
    this.filePath = '';
    this.bytesRecorded = 0;
  }

  /**
   * Generates a 44-byte WAV header for s16le PCM.
   */
  _getWavHeader(dataLength) {
    const buffer = Buffer.alloc(44);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataLength, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size
    buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
    buffer.writeUInt16LE(2, 22);  // NumChannels (Stereo)
    buffer.writeUInt32LE(48000, 24); // SampleRate
    buffer.writeUInt32LE(48000 * 2 * 2, 28); // ByteRate
    buffer.writeUInt16LE(4, 32);  // BlockAlign
    buffer.writeUInt16LE(16, 34); // BitsPerSample
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataLength, 40);
    return buffer;
  }

  /**
   * Starts scrcpy in audio-only recording mode.
   * Outputs raw PCM to stdout for analysis and saves to a valid WAV file.
   */
  async startRecording() {
    if (this.scrcpyProcess) return;

    this.filePath = path.resolve(process.cwd(), appConfig.AUDIO.TEMP_FILE);
    if (fs.existsSync(this.filePath)) fs.unlinkSync(this.filePath);

    this.fileStream = fs.createWriteStream(this.filePath);
    this.bytesRecorded = 0;

    // Write initial header (size 0, will be updated later)
    this.fileStream.write(this._getWavHeader(0));

    const args = [
      '--no-video',
      `--audio-source=${appConfig.AUDIO.AUDIO_SOURCE}`,
      '--audio-codec=raw',
      '--audio-output-format=raw',
      '--no-window',
      '--no-control',
      '--no-audio-playback',
      '-',
    ];

    console.log('Starting scrcpy audio analysis stream with WAV header...');
    this.scrcpyProcess = spawn(appConfig.AUDIO.SC_RC_PY_PATH, args);

    this.scrcpyProcess.stdout.on('data', (chunk) => {
      // 1. Save to file
      if (this.fileStream) {
          this.fileStream.write(chunk);
          this.bytesRecorded += chunk.length;
      }

      // 2. RMS Analysis for UI
      let sum = 0;
      for (let i = 0; i < chunk.length; i += 2) {
        if (i + 1 >= chunk.length) break;
        const sample = chunk.readInt16LE(i);
        sum += sample * sample;
      }
      const rms = Math.sqrt(sum / (chunk.length / 2));
      const level = Math.min(rms / 16384, 1); // Increased sensitivity
      
      this.emit('audio-level', level);
    });

    return new Promise((resolve) => {
      setTimeout(resolve, 800);
    });
  }

  async stopRecording() {
    if (!this.scrcpyProcess) return null;

    return new Promise((resolve) => {
      this.scrcpyProcess.on('close', () => {
        if (this.fileStream) {
            this.fileStream.end(() => {
                // Update WAV header with actual recorded size
                const fd = fs.openSync(this.filePath, 'r+');
                const header = this._getWavHeader(this.bytesRecorded);
                fs.writeSync(fd, header, 0, header.length, 0);
                fs.closeSync(fd);
                
                this.scrcpyProcess = null;
                resolve(this.filePath);
            });
        } else {
            this.scrcpyProcess = null;
            resolve(this.filePath);
        }
      });
      this.scrcpyProcess.kill('SIGINT');
    });
  }
}

module.exports = new ScrcpyManager();
