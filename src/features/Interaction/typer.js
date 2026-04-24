/**
 * typer.js
 * Feature: Interaction
 * Universal Mode: Always Copy + Always Paste (Ctrl+V).
 * v34.0: Zero-detection logic for maximum reliability.
 */

const { exec, spawn } = require('child_process');

/**
 * Copies text to clipboard and triggers a universal Ctrl+V paste.
 */
const type = async (text) => {
    if (!text) return;
    
    console.log(`Interaction: Copying and Pasting ${text.length} chars...`);
    
    try {
        // 1. Copy to System Clipboard (Ctrl+V)
        const xclip = spawn('xclip', ['-selection', 'clipboard', '-i']);
        xclip.stdin.write(text);
        xclip.stdin.end();

        // 2. Copy to Primary Selection (Middle-click)
        const xclipPrimary = spawn('xclip', ['-selection', 'primary', '-i']);
        xclipPrimary.stdin.write(text);
        xclipPrimary.stdin.end();

        // 3. Small buffer to ensure xclip is finished
        await new Promise(r => setTimeout(r, 150));

        // 4. Trigger Universal Paste (Ctrl+V)
        // Works in Browsers, Editors, and standard GUI apps.
        // In terminals, this may do nothing, but the text is safe in your clipboard.
        exec('xdotool key --delay 10 ctrl+v');

    } catch (err) {
        console.error('Interaction: Injection failed:', err);
    }
};

/**
 * Triggers a dummy key to ensure OS permissions are active.
 */
const triggerPermissionProbe = async () => {
    try {
        exec('xdotool key shift');
    } catch (err) {}
};

module.exports = {
    type,
    triggerPermissionProbe
};
