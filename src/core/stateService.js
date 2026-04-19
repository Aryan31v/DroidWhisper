/**
 * stateService.js
 * Central Application State Machine for DroidWhisper.
 * Tracks starts, stops, and UI status updates.
 */

let mainWindow = null;
let isStarting = false;
let isStopping = false;
let activeSelection = '';
let activeApp = { app: 'Unknown', title: 'Unknown' };

const setMainWindow = (win) => {
    mainWindow = win;
};

const getStatus = () => ({
    isStarting,
    isStopping,
    activeSelection,
    activeApp
});

const setStatus = (status) => {
    if (status.isStarting !== undefined) isStarting = status.isStarting;
    if (status.isStopping !== undefined) isStopping = status.isStopping;
    if (status.activeSelection !== undefined) activeSelection = status.activeSelection;
    if (status.activeApp !== undefined) activeApp = status.activeApp;
};

const broadcastChange = (statusLabel) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('status-change', statusLabel);
    }
};

const notifyContext = (captured, appName) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('context-captured', { captured, app: appName });
    }
};

module.exports = {
    setMainWindow,
    getStatus,
    setStatus,
    broadcastChange,
    notifyContext
};
