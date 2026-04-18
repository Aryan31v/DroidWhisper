# DroidWhisper 🎙️📱

**Transform your Android phone into a high-end, system-wide microphone for your PC.**

DroidWhisper is a local, offline speech-to-text utility designed for users who need professional-grade transcription without the cost of expensive hardware or the privacy risks of cloud-based services.

---

## ⚡ The Problem
Quality desktop microphones are often expensive, and high-end audio setups can be cumbersome. Simultaneously, most speech-to-text solutions rely on internet connectivity, introducing latency and compromising your privacy by sending your voice data to external servers.

## 🚀 The Solution
DroidWhisper bridges the gap by leveraging the advanced microphone hardware in your pocket. By connecting your Android phone via USB, DroidWhisper captures high-fidelity audio, processes it locally using AI, and types the result directly into any active application on your system.

**No Cloud. No Data Leaks. Just pure, local performance.**

---

## ✨ Features
- **Smart Startup UX**: Clearly displays "STARTING..." while the AI model loads, switching to "READY" only when the system is fully active.
- **Local AI Transcription**: Powered by `faster-whisper` (OpenAI Whisper optimized).
- **Toggle Control**: One-click (**Alt + CapsLock**) to start/stop transcription.
- **Privacy First**: Fully offline; no audio data ever leaves your machine.
- **System-Wide Integration**: Types transcribed text directly into any editor (Cursor, Slack, Chrome, etc.).
- **Latched Hotkeys**: Professional state-latching prevents looping or accidental double-toggles.

---

## 🛠️ Installation

### 1. Prerequisites
- **Linux** (Tested on Arch Linux).
- **Node.js** & **npm**.
- **Python 3.8+**.
- **System Tools**: `scrcpy`, `adb`, `xdotool`.

### 2. Automatic Setup
Navigate to the project directory and run the setup script:
```bash
chmod +x setup.sh
./setup.sh
```
This script will verify your system dependencies, create a Python virtual environment, and install all required AI libraries.

### 3. Desktop Setup
Ensure **USB Debugging** is enabled on your Android device. [See guide here](https://developer.android.com/studio/debug/dev-options).

---

## 🎮 Usage

1. **Connect Device**: Plug in your Android phone via USB.
2. **Launch DroidWhisper**:
   ```bash
   npm start
   ```
3. **Wait for READY**: The status bar will show "READY" once the AI model is loaded.
4. **Transcribe**: 
   - Press **Alt + CapsLock** once to start recording.
   - Speak your phrase.
   - Press **Alt + CapsLock** again to stop.
   - The text will be typed instantly wherever your cursor is focused.

---

## 📜 License
This project is released under the **MIT License**.
