/**
 * stateService.js
 * Central Application State Machine for DroidWhisper.
 * Tracks starts, stops, and UI status updates.
 */

let mainWindow = null;
let isStarting = false;
let isStopping = false;
let isServiceReady = false;

const setMainWindow = (win) => {
    mainWindow = win;
};

const getStatus = () => ({
    isStarting,
    isStopping,
    isServiceReady
});

const setStatus = (status) => {
    if (status.isStarting !== undefined) isStarting = status.isStarting;
    if (status.isStopping !== undefined) isStopping = status.isStopping;
    if (status.isServiceReady !== undefined) isServiceReady = status.isServiceReady;
};

const broadcastChange = (statusLabel) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('status-change', statusLabel);
    }
};

module.exports = {
    setMainWindow,
    getStatus,
    setStatus,
    broadcastChange
};
