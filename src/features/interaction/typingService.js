/**
 * typingService.js
 * Simulates keyboard input to type transcribed text into the active window.
 * Uses xdotool.
 */

const { spawn } = require('child_process');

/**
 * Types the given text into the active window.
 * @param {string} text - The text to type.
 * @returns {Promise<void>}
 */
const typeText = (text) => {
  return new Promise((resolve, reject) => {
    if (!text) {
      resolve();
      return;
    }

    console.log('Typing text meticulously using stdin pipe...');

    // Use stdin pipe to avoid shell escaping issues with special characters (e.g. apostrophes)
    const xdotool = spawn('xdotool', ['type', '--clearmodifiers', '--delay', '3', '--file', '-']);

    xdotool.on('error', (err) => {
      console.error('Failed to start xdotool:', err);
      reject(err);
    });

    xdotool.on('close', (code) => {
      if (code !== 0) {
        console.warn(`xdotool exited with code ${code}`);
      }
      resolve();
    });

    // Write text to stdin and close it
    xdotool.stdin.write(text);
    xdotool.stdin.end();
  });
};

module.exports = {
  typeText,
};
