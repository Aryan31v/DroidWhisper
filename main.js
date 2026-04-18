/**
 * main.js
 * Entry point for DroidWhisper Electron Application.
 * Orchestrates: scrcpy, Whisper service, and typing simulation.
 * Exports: None.
 * Dependencies: electron, scrcpyManager, transcriptionBridge, typingService.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const scrcpyManager = require('./src/features/audio/scrcpyManager');
const transcriptionBridge = require('./src/features/transcription/transcriptionBridge');
const typingService = require('./src/features/interaction/typingService');

let mainWindow;
let isStarting = false;
let isStopping = false;

// Attach globally for the bridge to call back
app.onWhisperEvent = async (event) => {
  console.log('Orchestrator Event:', event);

  if (event === 'recording_start') {
    if (isStarting || isStopping) return;
    isStarting = true;
    console.log('Main: Starting recording flow...');
    try {
      await scrcpyManager.startRecording();
      if (mainWindow) {
          mainWindow.webContents.send('status-change', 'Recording...');
      }
    } finally {
      isStarting = false;
    }
  } else if (event === 'recording_stop') {
    if (isStopping) return;
    isStopping = true;
    console.log('Main: Stopping recording and transcribing...');
    if (mainWindow) {
        mainWindow.webContents.send('status-change', 'Transcribing...');
    }
    
    // Add a small grace period to ensure scrcpy captures the last bit
    setTimeout(async () => {
      try {
        const audioFile = await scrcpyManager.stopRecording();
        if (!audioFile) return;

        const result = await transcriptionBridge.transcribe(audioFile);
      
      if (result.text) {
        if (mainWindow) {
            mainWindow.webContents.send('status-change', 'Ready');
        }
        await typingService.typeText(result.text);
      } else if (result.error) {
        console.error('Transcription Error:', result.error);
        if (mainWindow) {
            mainWindow.webContents.send('status-change', 'Error');
        }
      }
    } catch (err) {
      console.error('Error in orchestrator:', err);
    } finally {
      isStopping = false;
    }
  }, 100);
  }
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 60,
    x: 0, // Left
    y: 50, // Top offset
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    transparent: false,
    backgroundColor: '#141419', // Solid dark background
    alwaysOnTop: true,
    resizable: false,
  });

  // Center horizontally at the top
  mainWindow.center();
  const [width, height] = mainWindow.getSize();
  mainWindow.setPosition(mainWindow.getPosition()[0], 20);

  mainWindow.loadFile('src/ui/index.html');
}

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
