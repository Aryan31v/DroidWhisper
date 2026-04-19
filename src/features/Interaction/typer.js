/**
 * typer.js
 * Feature: Interaction
 * High-performance text injection using clipboard and keyboard emulation.
 */

const { exec } = require('child_process');
const { spawn } = require('child_process');

/**
 * Injects text into the active cursor position.
 */
const type = async (text) => {
    if (!text) return;
    
    console.log(`Interaction: Injecting ${text.length} chars...`);
    
    try {
        // Professional xclip pipe for stable injection (v24.0 approach)
        const xclip = spawn('xclip', ['-selection', 'clipboard', '-i']);
        xclip.stdin.write(text);
        xclip.stdin.end();

        // Give the OS 100ms to register the clipboard change
        await new Promise(r => setTimeout(r, 100));
        
        // Execute Paste
        exec('xdotool key --delay 10 ctrl+v');

        // Professional Buffer: Wait for target app to ingest before restoration
        // Value increased to 1.2s for VS Code stability
        await new Promise(r => setTimeout(r, 1200));

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
