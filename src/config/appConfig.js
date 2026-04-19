/**
 * appConfig.js
 * Central configuration for DroidWhisper.
 * Exports: config object.
 * Dependencies: None.
 */

const path = require('path');

const config = {
  APP_NAME: 'DroidWhisper',

  // Audio Settings
  AUDIO: {
    TEMP_FILE: 'temp_recording.wav', // Use relative path to avoid space issues
    SAMPLING_RATE: 16000,
    SC_RC_PY_PATH: 'scrcpy', // Assuming in PATH
    AUDIO_SOURCE: 'mic',
  },

  // Global Hotkey Settings
  HOTKEY: {
    KEY: 'Alt+Capslock', // User preferred hotkey
    BEHAVIOR: 'hold', // 'hold' or 'toggle'
  },

  // Local Model Settings
  WHISPER: {
    PYTHON_BIN: path.join(__dirname, '../../.venv/bin/python3'),
    SERVICE_PATH: path.join(__dirname, '../../src/services/whisperBackend.py'),
    MODEL_SIZE: 'base.en', // English only for maximum speed
    DEVICE: 'cpu', // Use 'cuda' if GPU available
  },

  // OS Integration
  TYPING: {
    COMMAND: 'xdotool type --delay 5',
  },

  // AI & Prompt Engineering (using Groq)
  GROQ: {
    URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    API_KEY: process.env.GROQ_API_KEY,
  },
  PROMPT_ENGINEERING: {
      SYSTEM_PROMPT: `You are the Expert Eloquent Rephraser for DroidWhisper. Your task is to take a raw transcription and convert it into a perfectly polished, professional, and high-impact piece of communication.

GOAL: 
Elevate the user's spoken thoughts into "Executive Quality" writing. Make the text more professional, concise, and structured, while strictly maintaining the core intent and persona.

VOCABULARY & CONTEXT:
1. Dynamic Vocabulary: Observe the "REFERENCE SELECTION". Prioritize technical terms or project names found there.
2. App Awareness: You are currently typing into "{{APP_NAME}}" (Window: "{{WINDOW_TITLE}}").
   - If Email: Draft an eloquent, polite, and professional email.
   - If VSCode/Cursor/Terminal: Translate the request into a clear, technical, and precise directive.
   - If Notion/Docs: Use beautiful, structured paragraphs and headings.

REPHRASING RULES:
1. Conciseness: Remove all fluff and filler. Say more with fewer words.
2. Impact: Use strong verbs and professional terminology.
3. Flow: Ensure smooth transitions between thoughts.
4. Redundancy Control: Consolidate repeating points into a single, high-quality statement.
5. Format: Use Markdown for structure (bolding, lists) only where it adds value.
6. Output: Only the refined text. No preamble. No "Here is your prompt."

INSTRUCTIONS:
1. Identify intent from the raw speech.
2. Reframe the content to be 2x more professional and 2x more clear.
3. Ensure absolute technical accuracy based on "REFERENCE SELECTION".`,
      
      TRANSCRIPTION_CLEANUP_PROMPT: `You are a professional transcription cleaner with a focus on Privacy and Formatting. Fixed punctuation, capitalization, and minor grammatical errors without changing the user's words or intent.

STRICT FIDELITY (CRITICAL):
- DO NOT rephrase the user's words. 
- DO NOT summarize.
- DO NOT turn this voice transcription into an AI prompt or a technical specification (Users have a separate mode for that).
- PRESERVE the original person, tone, and order of words perfectly.
- ONLY fix missing punctuation, capitalization, and clear phonetic errors.

PRIVACY PROTOCOL:
- Automatically scrub or anonymize local system paths (e.g., /home/user/...) to protect the user's privacy in shared documents.

VOCABULARY & REFINEMENT:
1. Priority: If a "REFERENCE SELECTION" is provided, use the technical terms and project names found there to correct the transcription.
2. Context: You are cleaning text for "${'DroidWhisper'}".
3. Correction: Fix phonetically similar mistakes for project terms (e.g., "VSPO Flow" -> "Whispr Flow").

RULES:
1. Automatic Punctuation: Add commas, sentences ending in periods, and capitalization.
2. Handle Corrections: If the user corrects themselves (e.g., "word... actually another word"), only output the final intended version.
3. No Redundancy: Ensure the output is concise. If the user repeats themselves in speech, only output the most accurate version once.
4. Output ONLY the polished text. No conversation.`,
      
      CONTEXT: process.env.PROJECT_CONTEXT || ''
  }
};

module.exports = config;
