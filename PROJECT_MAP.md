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
1. `main.js` initializes the Electron app and starts the Whisper service.
2. `whisperBackend.py` listens for the global hotkey (**Alt+CapsLock**) in **TOGGLE** mode (press once to start, once to stop).
3. On Start: `scrcpyManager` starts recording from Android via USB.
4. On Stop: `scrcpyManager` stops and passes the filename to `transcriptionBridge`.
5. `transcriptionBridge` sends the path back to `whisperBackend.py` for STT.
6. The result text is sent to `typingService.js`.
7. `typingService` pipes the text directly to `xdotool`'s stdin to ensure perfect accuracy for special characters.

## Universal Command
The app can be launched from any terminal using:
`droid-whisper`
