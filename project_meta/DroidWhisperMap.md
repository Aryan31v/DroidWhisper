# 🛰️ DroidWhisper: Feature Intelligence Map

DroidWhisper has evolved from a simple transcription tool into a **High-Fidelity Autonomous Agent**. Below is a comprehensive map of the current architecture, intelligence, and premium UI features.

---

### 🧠 1. The 'Droid' Intelligent Agent
The heart of the system is the **Autonomous Intent Engine**. Droid no longer needs buttons; he listens to your words to decide his own behavior.

- **Natural Language Triggering**: Listening for "Droid" or "Hey Droid" to activate command processing.
- **Intent-Based Routing**:
    - **DICT (Literal)**: 100% faithful preservation of your original words. Triggered by saying *"just transcribe"* or simply talking without a command.
    - **FLOW (Professional)**: Rephrases rambling thoughts into "Executive Quality" communication. Triggered by saying *"make this more professional"* or *"rephrase this."*
    - **CRAFT (Transformation)**: Structured data extraction. Triggered by saying *"turn this into bullets"* or *"summarize this."*
- **Silence Detection & 800ms Warm-up**: Precision timing to ensure no words are lost at the start or clipped at the end.

---

### 🎨 2. Premium Design & UX Aesthetics
Designed to be "Alive" and non-intrusive.

- **The Morphing Pill**: The UI dynamically resizes its width (210px to 310px) to fit the current status (READY, TRANSMITTING, DROID THINKING) without clipping text.
- **Breathing Waveform**: A staggered CSS-based animation that provides rhythmic visual feedback during recording. **Zero CPU overhead** (no microphone permission required for the animation itself).
- **Identity Glows**:
    - **Emerald Green**: Dictation Mode.
    - **Royal Purple**: Droid Thinking / Rephrasing Mode.
    - **Golden Amber**: Crafting / Transformation Mode.
- **Floating Persistence**: Stays on top of all windows, centered at the top for easy visual reference.

---

### 🎯 3. Precision & Context Tuning
Getting the results right the first time, every time.

- **Custom Vocabulary (`vocabulary.json`)**: A persistent "Personal Dictionary." Droid prioritizes these words if any audio sounds phonetically similar (e.g., "Cryponic", "Antigravity").
- **Snippet Expansion (`snippets.json`)**: Vocal macros. Say *"insert meeting link"* and Droid automatically swaps the keyword for the full URL.
- **Strict Literal Transcription**: Enhanced AI rules to ensure your core meaning and wording are preserved without unwanted rephrasing.
- **App & Tool Awareness**: Pre-configured knowledge of modern tools:
    - **IDEs**: VS Code, Antigravity (by Google).
    - **Note-taking**: Notion, Obsidian.
    - **AI Models**: Google Flow (Image/Video).

---

### ⚙️ 4. Stability Core (The Engine)
Battle-tested stability for professional use.

- **Native scrcpy Recording**: Reverted to the ultra-stable `--record` flag to prevent audio drops and transcription hangs on older hardware.
- **Clipboard Management**: Uses `xclip` to inject text into both the system clipboard and primary selection. Supports standard `Ctrl+V` and terminal middle-click pasting.
- **Universal Commands**: Manage the service from any terminal with `droidwhisper start`, `stop`, `restart`, and `status`.
- **Process Orchestration**: Automatically handles the startup of the Whisper Python server and USB connections to your Android device.

---

### 📂 5. File Anatomy
| File | Role |
| :--- | :--- |
| `main.js` | The "Central Nervous System" / Orchestrator. |
| `src/ui/` | The "Body" (HTML/CSS/JS refactored for performance). |
| `src/features/AI/intelligenceService.js` | The "Smart Brain" (AI processing & refinement). |
| `src/features/Interaction/intentService.js` | The "Interpreter" (Intent detection & Snippets). |
| `src/features/Interaction/typer.js` | The "Clipboard Engine" (Copy to system selections). |
| `src/config/snippets.json` | The "Tools" (Your vocal macros). |

---
*Created with the precision of bash and the innovative spirit of Cryponic.*
