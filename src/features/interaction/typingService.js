/**
 * typingService.js
 * Uses xdotool to simulate keyboard input in the active window.
 * Exports: typeText function.
 * Dependencies: child_process, appConfig.
 * Used by: main.js or transcriptionBridge result handler.
 */

const { exec } = require('child_process');
const { appConfig } = require('../../config');

/**
 * Types the given text into the active window.
 * @param {string} text - The text to type.
 * @returns {Promise<void>}
 */
const typeText = (text) => {
  if (!text) return Promise.resolve();

  // Escape special characters for shell and xdotool
  // xdotool needs some characters escaped or handled specifically
  const escapedText = text
    .replace(/"/g, '\\"')
    .replace(/'/g, "'\\''")
    .replace(/\n/g, ' '); 

  const command = `xdotool type --clearmodifiers --delay 5 "${escapedText}"`;

  console.log('Typing text...', command);

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('xdotool failed:', stderr);
        reject(error);
        return;
      }
      resolve();
    });
  });
};

module.exports = {
  typeText,
};
