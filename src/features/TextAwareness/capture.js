/**
 * capture.js
 * Feature: TextAwareness
 * Low-level OS integration for screen recognition and selection capturing.
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Gets the current primary selection (highlight) only.
 */
const getHighlightOnly = async () => {
    try {
        const { stdout } = await execPromise('wl-paste --primary --no-newline');
        return stdout.trim();
    } catch (err) {
        return ''; // No selection
    }
};

/**
 * Gets context from either selection or primary buffer.
 */
const getPrimarySelection = async () => {
    try {
        const result = await getHighlightOnly();
        return result || '';
    } catch (err) {
        return '';
    }
};

/**
 * Gets information about the active window.
 */
const getActiveWindowInfo = async () => {
    try {
        // Wayland/X11 Hybrid Recursive Search
        const { stdout: windowId } = await execPromise('xdotool getactivewindow');
        const { stdout: windowName } = await execPromise(`xdotool getwindowname ${windowId.trim()}`);
        const { stdout: windowClass } = await execPromise(`xdotool getwindowclassname ${windowId.trim()}`);
        
        return {
            app: windowClass.trim() || 'Unknown',
            title: windowName.trim() || 'Unknown'
        };
    } catch (err) {
        return { app: 'Restricted', title: 'Wayland/Security Restricted' };
    }
};

module.exports = {
    getHighlightOnly,
    getPrimarySelection,
    getActiveWindowInfo
};
