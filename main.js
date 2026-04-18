/**
 * main.js
 * Entry point for DroidWhisper Electron Application.
 * Orchestrates: scrcpy, Whisper service, and typing simulation.
 * Exports: None.
 * Dependencies: electron, scrcpyManager, transcriptionBridge, typingService.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();
const scrcpyManager = require('./src/features/audio/scrcpyManager');
const transcriptionBridge = require('./src/features/transcription/transcriptionBridge');
const typingService = require('./src/features/interaction/typingService');
const promptService = require('./src/features/interaction/promptService');

let mainWindow;
let isStarting = false;
let isStopping = false;
let currentMode = 'dictation';
let activeSelection = '';
let activeApp = { app: 'Unknown', title: 'Unknown' };

// Handle UI mode switching
ipcMain.on('mode-switch', (event, mode) => {
  console.log('UI Mode Switched to:', mode);
  currentMode = mode;
});

app.onWhisperEvent = async (eventData) => {
  const event = typeof eventData === 'string' ? eventData : eventData.event;
  console.log('Orchestrator Event:', event);

  if (event === 'recording_start') {
    if (isStarting || isStopping) return;
    isStarting = true;
    
    // 1. Capture contextual information
    activeSelection = await typingService.getPrimarySelection();
    activeApp = await typingService.getActiveWindowInfo();
    
    console.log('Main: Context Snapshot:', {
        app: activeApp.app,
        selection: activeSelection ? activeSelection.substring(0, 30) + '...' : 'None'
    });

    if (activeSelection && mainWindow) {
        mainWindow.webContents.send('context-captured', true);
    } else if (mainWindow) {
        mainWindow.webContents.send('context-captured', false);
    }

    console.log(`Main: Starting recording flow (Mode: ${currentMode})...`);
    try {
      await scrcpyManager.startRecording();
      if (mainWindow) {
          mainWindow.webContents.send('status-change', currentMode === 'prompt' ? 'RECORDING (PROMPT)' : 'Recording...');
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
        let finalOutput = result.text;
        
        if (currentMode === 'prompt') {
            mainWindow.webContents.send('status-change', 'ENGINEERING PROMPT...');
            finalOutput = await promptService.refinePrompt(result.text, activeSelection, activeApp);
        } else {
            // Smart Dictation: Polishing raw transcription
            mainWindow.webContents.send('status-change', 'POLISHING...');
            finalOutput = await promptService.cleanTranscription(result.text, activeSelection, activeApp);
        }

        // 3. Inject text
        mainWindow.webContents.send('status-change', 'TYPING...');
        await typingService.typeText(finalOutput);
        
        mainWindow.webContents.send('status-change', 'READY (ALT+CAPSLOCK)');
        activeSelection = ''; // Reset selection context
        activeApp = { app: 'Unknown', title: 'Unknown' }; // Reset app context
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
  } else if (event === 'service_ready') {
    if (mainWindow) {
        mainWindow.webContents.send('status-change', 'READY');
    }
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
