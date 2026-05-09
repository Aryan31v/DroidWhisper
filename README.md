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

## 📡 Wi-Fi Connectivity & Troubleshooting

DroidWhisper features a **Kernel ARP Auto-Discovery** module that makes connecting over direct Wi-Fi hotspots completely seamless, eradicating issues caused by dynamic DHCP IP rotations and MAC randomization. 

**If you encounter the error `ADB stream failed to find` or `is scrcpy enabled in your phone`, it means your phone's Android Debug Bridge (ADB) daemon is not listening on the correct transport port. Follow this initialization bootstrap:**

1. Connect your Android phone via **USB** (ensure USB Debugging is enabled).
2. Open your terminal and run the ADB port binding command:
   ```bash
   adb tcpip 5555
   ```
3. Wait for the terminal to output `restarting in TCP mode port: 5555`.
4. **Disconnect the USB cable.** 

When you trigger DroidWhisper, it will now automatically interrogate the Linux Kernel's ARP Cache, dynamically extract your phone's rotating Wi-Fi IP address, and establish a flawless audio transport stream over the air.

*(Note: The Android OS terminates the TCP/IP daemon when the device powers down. You only need to execute `adb tcpip 5555` via USB once per phone reboot).*

---

## 🛡️ Security & Privacy
*   **Local-First Design**: Audio capture and system automation occur entirely on your local machine.
*   **Transparent Interaction**: Droid only interacts with your system when you provide permission or trigger a dictation.

---

**Developed with ❤️ by Cryponic & Droid.**
*"The language of your tools, spoken naturally."*
