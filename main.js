/**
 * main.js
 * Entry point for DroidWhisper Electron Application.
 * Ultimate Organizaton Launcher (v26.0)
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

// Features (Organized by Semantic Responsibility)
const stateService = require('./src/core/stateService');
const orchestrator = require('./src/features/Dictation/orchestrator');
const typer = require('./src/features/Interaction/typer');
const transcriptionBridge = require('./src/features/Dictation/transcriptionBridge');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 60,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.center();
  mainWindow.setPosition(mainWindow.getPosition()[0], 20);
  mainWindow.loadFile('src/ui/index.html');

  // Linux Transparency Fix: Ensure window is visible and on top
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  });

  // Link status updates to the UI
  stateService.setMainWindow(mainWindow);
}

/**
 * Global Host Event Dispatcher
 */
app.onWhisperEvent = async (eventData) => {
  const event = typeof eventData === 'string' ? eventData : eventData.event;
  console.log(`Main: Routing -> ${event}`);

  switch (event) {
    case 'recording_start':
      await orchestrator.handleStart();
      break;
    case 'recording_stop':
      await orchestrator.handleStop();
      break;
    case 'service_ready':
      stateService.setStatus({ isServiceReady: true });
      stateService.broadcastChange('READY');
      break;
  }
};

// Interaction Bridges
ipcMain.on('trigger-permission-probe', async () => {
  await typer.triggerPermissionProbe();
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  transcriptionBridge.startService();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  transcriptionBridge.stopService();
  if (process.platform !== 'darwin') app.quit();
});
