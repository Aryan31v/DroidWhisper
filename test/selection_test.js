/**
 * selection_test.js
 * Standalone verification script for the TextAwareness feature.
 * Run this to see a live stream of captured text in your terminal.
 */

const capture = require('../src/features/TextAwareness/capture');

console.log('\x1b[32m%s\x1b[0m', '--- Droid Selection Verification Test ---');
console.log('Instructions: Select any text in another window to see it captured here.');
console.log('Press Ctrl+C to stop.\n');

let lastCaptured = '';

const runTest = async () => {
    setInterval(async () => {
        try {
            const selection = await capture.getHighlightOnly();
            const windowInfo = await capture.getActiveWindowInfo();

            if (selection && selection !== lastCaptured) {
                lastCaptured = selection;
                console.log('\x1b[36m%s\x1b[0m', `[${new Date().toLocaleTimeString()}] CAPTURED!`);
                console.log(`Application: ${windowInfo.app}`);
                console.log(`Content: "${selection}"`);
                console.log('---');
            } else if (!selection && lastCaptured) {
                lastCaptured = '';
                console.log('\x1b[33m%s\x1b[0m', `[${new Date().toLocaleTimeString()}] Selection Cleared.`);
            }
        } catch (err) {
            // Silent error
        }
    }, 200); // 200ms scan for testing
};

runTest();
