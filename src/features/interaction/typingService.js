/**
 * typingService.js
 * Simulates keyboard input to type transcribed text into the active window.
 * Uses xdotool.
 */

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Types the given text into the active window using the clipboard (Paste) 
 * to ensure maximum speed and perfect formatting.
 * @param {string} text - The text to inject.
 * @returns {Promise<void>}
 */
const typeText = async (text) => {
  if (!text) return;

  console.log('Injecting text via Clipboard (Paste) for perfect formatting...');

  let originalClipboard = '';
  try {
    // 1. Save current clipboard content
    const { stdout } = await execAsync('xclip -selection clipboard -o').catch(() => ({ stdout: '' }));
    originalClipboard = stdout;

    // 2. Set new content to clipboard using stdin pipe (handles all characters/newlines)
    const xclip = spawn('xclip', ['-selection', 'clipboard', '-i']);
    xclip.stdin.write(text);
    xclip.stdin.end();

    // Small delay to ensure xclip has finished writing
    await new Promise(r => setTimeout(r, 100));

    // 3. Trigger Paste (Ctrl+V)
    await execAsync('xdotool key --clearmodifiers ctrl+v');

    // 4. Restore original clipboard after a short delay
    if (originalClipboard) {
      setTimeout(() => {
        const restore = spawn('xclip', ['-selection', 'clipboard', '-i']);
        restore.stdin.write(originalClipboard);
        restore.stdin.end();
      }, 500); // Wait for the paste to be processed by the target app
    }
  } catch (err) {
    console.error('Clipboard Injection failed, falling back to xdotool type:', err);
    // Fallback if xclip fails
    await execAsync(`xdotool type --clearmodifiers --delay 5 --file - <<EOF\n${text}\nEOF`);
  }
};

const module_exports = {
  typeText,
  getPrimarySelection: async () => {
    try {
      // Fetch the 'primary' selection (currently highlighted text in X11)
      const { stdout } = await execAsync('xclip -selection primary -o').catch(() => ({ stdout: '' }));
      return stdout.trim();
    } catch (err) {
      console.warn('Could not fetch primary selection:', err);
      return '';
    }
  }
};

module.exports = module_exports;
