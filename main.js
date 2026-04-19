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
    x: 0,
    y: 50,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
  });

  mainWindow.center();
  mainWindow.setPosition(mainWindow.getPosition()[0], 20);
  mainWindow.loadFile('src/ui/index.html');

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
