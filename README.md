# DroidWhisper 🎙️🤖 (v28.0)

**The Agentic Transformation Engine for Professional Dictation.**

DroidWhisper transforms your desktop experience by integrating a specialized AI companion directly into your system. Unlike standard dictation tools, Droid is **Context-Aware**—he knows which application you are using, understands your intent, and adapts his writing tone to match your professional needs.

---

## ✨ Core Features

DroidWhisper includes high-intelligence behaviors for professional dictation:

*   **🔄 Backtrack Logic (Self-Correction)**: Droid recognizes when you change your mind mid-sentence. If you say "Meet at 2... actually 3 PM," Droid automatically types **"Meet at 3:00 PM."**
*   **📝 Natural Auto-Lists**: Speak naturally and watch Droid format your thoughts into clean, vertical lists without needing "new line" commands.
*   **🧹 Professional Punctuation & Fidelity**: Droid preserves 100% of your spoken words while applying perfect capitalization, punctuation, and removing "ums/ahs."

---

## 🏗️ Feature-First Architecture

The project has been reorganized into semantic, isolated modules for maximum stability:
- **`Dictation/`**: Manages the core audio-to-text recording path.
- **`Interaction/`**: Low-level system integration for text injection and automation.
- **`AI/`**: The "Brain" (Agentic Intelligence) that handles task-solving and tone adaptation.

---

## 🛠️ Getting Started

### 1. Installation
```bash
git clone https://github.com/Aryan31v/DroidWhisper.git
cd DroidWhisper
npm install
```

### 2. Startup
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Launching Droid
```bash
npm start
```
*Hotkey: **Alt+CapsLock** triggers Droid from any application.*

---

## 📋 Requirements
*   **OS**: Linux (Optimized for Wayland/X11).
*   **System Tools**: `scrcpy`, `xdotool`, `xclip`, `wl-clipboard`, and `adb`.
*   **AI**: Requires a [Groq API Key](https://console.groq.com) for high-speed agentic processing.

---

## 🛡️ Security & Privacy
*   **Local-First Design**: Audio capture and system automation occur entirely on your local machine.
*   **Transparent Interaction**: Droid only interacts with your system when you provide permission or trigger a dictation.

---

**Developed with ❤️ by Cryponic & Droid.**
*"The language of your tools, spoken naturally."*
