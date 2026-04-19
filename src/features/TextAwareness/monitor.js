const { spawn } = require('child_process');
const capture = require('./capture');
const stateService = require('../../core/stateService');

/**
 * monitor.js
 * Feature: TextAwareness
 * Zero-Latency Event-Driven Monitor (Wayland).
 */

let monitorProcess = null;
let lastSelectionState = false;

const start = () => {
    if (monitorProcess) return;

    try {
        console.log('Awareness: Starting Event-Driven Wayland listener (wl-paste --watch)...');
        
        // v26.0: Persistent listener. sh -c 'echo CHANGE' provides a lightweight trigger
        monitorProcess = spawn('wl-paste', ['--primary', '--watch', 'sh', '-c', 'echo "CHANGE"']);

        monitorProcess.stdout.on('data', async () => {
            const { isStarting, isStopping } = stateService.getStatus();
            if (isStarting || isStopping) return;

            try {
                const newSelection = await capture.getHighlightOnly();
                const newApp = await capture.getActiveWindowInfo();
                const status = stateService.getStatus();

                // Droid-Blindness (Hyphenated check)
                const isDWHidden = /droid[-]?whisper/i.test(newApp.app) || newApp.app === 'None';
                const captured = isDWHidden ? false : !!newSelection;

                // App Transition Logic
                if (newApp.app !== status.activeApp.app) {
                    stateService.setStatus({ activeSelection: '' });
                }

                // Real-Time Notification
                if (captured !== lastSelectionState || newApp.app !== status.activeApp.app) {
                    stateService.setStatus({ 
                        activeSelection: newSelection,
                        activeApp: newApp
                    });
                    lastSelectionState = captured;
                    stateService.notifyContext(captured, newApp.app);
                }
            } catch (err) {
                // Silent catch
            }
        });

        monitorProcess.on('error', (err) => {
            console.error('Awareness: Listener error:', err);
        });

    } catch (err) {
        console.error('Awareness: Failed to start event monitor:', err);
    }
};

const stop = () => {
    if (monitorProcess) {
        monitorProcess.kill();
        monitorProcess = null;
    }
};

module.exports = {
    start,
    stop
};
