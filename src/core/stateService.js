/**
 * stateService.js
 * Central Application State Machine for DroidWhisper.
 * Tracks starts, stops, and UI status updates.
 */

let mainWindow = null;
let isStarting = false;
let isStopping = false;

const setMainWindow = (win) => {
    mainWindow = win;
};

const getStatus = () => ({
    isStarting,
    isStopping
});

const setStatus = (status) => {
    if (status.isStarting !== undefined) isStarting = status.isStarting;
    if (status.isStopping !== undefined) isStopping = status.isStopping;
};

const broadcastChange = (statusLabel) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('status-change', statusLabel);
    }
};

const notifyContext = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('context-captured');
    }
};

module.exports = {
    setMainWindow,
    getStatus,
    setStatus,
    broadcastChange,
    notifyContext
};
