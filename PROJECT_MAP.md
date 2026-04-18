# DroidWhisper Project Map

## Project Overview
DroidWhisper is a local Speech-to-Text utility that uses an Android phone's microphone (via USB/scrcpy) as the audio source. It transcribes audio using a local Faster-Whisper model and types the output directly into the active window using `xdotool`.

## Folder Structure

- `/`
    - `PROJECT_MAP.md`: Project documentation and file map (this file).
    - `package.json`: Node.js/Electron configuration.
    - `.env`: Environment variables (secrets, paths).
    - `main.js`: Electron main process entry point.
- `src/`
    - `config/`: Application settings and constants.
        - `index.js`: Re-exports configuration.
        - `appConfig.js`: Model paths, hotkey settings, etc.
    - `features/`: Core functional modules.
        - `audio/`: `scrcpy` control and audio capture.
        - `transcription/`: Whisper model interface/bridge.
        - `interaction/`: Hotkeys and system-level typing.
    - `services/`: Shared system services.
        - `whisperBackend.py`: Python service for local transcription.
        - `systemCommands.js`: Wrappers for shell commands.
    - `shared/`: Utility functions and constants.
    - `ui/`: Electron frontend assets (HTML/CSS/JS).
    - `styles/`: Global CSS.

## File Connections
1. `main.js` initializes the Electron app and calls `hotkeyManager`.
2. `hotkeyManager` listens for `Alt+S`.
3. On KeyDown: `scrcpyManager` starts recording.
4. On KeyUp: `scrcpyManager` stops and passes filename to `transcriptionBridge`.
5. `transcriptionBridge` sends the path to `whisperBackend.py`.
6. Result text is sent to `typingService`.
7. `typingService` uses `xdotool` to input the text.
