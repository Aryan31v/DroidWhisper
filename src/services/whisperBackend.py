"""
whisperBackend.py
Local Faster-Whisper transcription service with Global Hotkey support.
Provides: Global hotkey listening (Alt+CapsLock) with LATCHED TOGGLE behavior.
Dependencies: faster-whisper, pynput.
Used by: transcriptionBridge.js.
"""

import sys
import os
import json
import threading
import time
from faster_whisper import WhisperModel
import ctranslate2
from pynput import keyboard

# State management
is_recording = False
pressed_keys = set()
hotkey_latched = False # Prevents re-triggering while keys are held
kb_controller = keyboard.Controller()

def on_press(key, signal_start, signal_stop):
    global is_recording, hotkey_latched
    pressed_keys.add(key)
    
    # Check for Alt + CapsLock
    has_alt = any(k in (keyboard.Key.alt, keyboard.Key.alt_l, keyboard.Key.alt_r) for k in pressed_keys)
    has_caps = keyboard.Key.caps_lock in pressed_keys
    
    if (has_alt and has_caps) or (key == keyboard.Key.f8):
        if not hotkey_latched:
            hotkey_latched = True
            if not is_recording:
                is_recording = True
                signal_start()
            else:
                is_recording = False
                signal_stop()

def on_release(key):
    global hotkey_latched
    if key in pressed_keys:
        pressed_keys.remove(key)
    
    # Unlatch if the hotkey combination is no longer fully held
    has_alt = any(k in (keyboard.Key.alt, keyboard.Key.alt_l, keyboard.Key.alt_r) for k in pressed_keys)
    has_caps = keyboard.Key.caps_lock in pressed_keys
    
    if not (has_alt and has_caps):
        hotkey_latched = False

def start_hotkey_listener(callback_start, callback_stop):
    def _on_press(key):
        on_press(key, callback_start, callback_stop)
            
    def _on_release(key):
        on_release(key)

    listener = keyboard.Listener(on_press=_on_press, on_release=_on_release)
    listener.start()

def main():
    # Configuration
    model_size = os.getenv("WHISPER_MODEL", "distil-large-v3")
    device = os.getenv("WHISPER_DEVICE", "cpu")
    
    # Auto-upgrade to CUDA if available
    if ctranslate2.get_cuda_device_count() > 0:
        device = "cuda"
        compute_type = "float16"
        print("DEBUG: CUDA available. Using GPU acceleration.", file=sys.stderr)
    else:
        compute_type = "int8"
        print("DEBUG: CUDA not found. Using CPU.", file=sys.stderr)

    initial_prompt = "The following is a high-fidelity verbatim transcription of a user speaking. Every word is preserved exactly."

    print(f"DEBUG: Initializing faster-whisper model '{model_size}'...", file=sys.stderr)
    
    try:
        model = WhisperModel(model_size, device=device, compute_type=compute_type)
        print(f"DEBUG: Model '{model_size}' loaded successfully.", file=sys.stderr)
    except Exception as e:
        print(json.dumps({"error": f"Model load failed: {str(e)}"}), flush=True)
        sys.exit(1)

    
    print("READY", flush=True)

    def signal_start():
        print(json.dumps({"event": "recording_start"}), flush=True)

    def signal_stop():
        print(json.dumps({"event": "recording_stop"}), flush=True)

    # Start hotkey listener
    start_hotkey_listener(signal_start, signal_stop)

    # IPC loop
    while True:
        line = sys.stdin.readline()
        if not line:
            break
            
        audio_path = line.strip()
        if not audio_path:
            continue
        
        if not os.path.exists(audio_path):
            print(json.dumps({"error": f"File not found: {audio_path}"}), flush=True)
            continue

        try:
            segments, info = model.transcribe(
                audio_path, 
                beam_size=5, # Higher beam size helps the tiny model stay on track
                best_of=5,
                vad_filter=True, # Filter out non-speech to prevent "cutting off"
                vad_parameters=dict(min_silence_duration_ms=1000),
                initial_prompt=initial_prompt, 
                condition_on_previous_text=False
            )
            
            result_text = ""
            last_end = 0
            
            for i, segment in enumerate(segments):
                seg_text = segment.text.strip()
                if not seg_text:
                    continue
                
                # If there's a significant gap (> 1.5s) between segments, or it's the first segment,
                # handle joining intelligently. 
                if i == 0:
                    result_text = seg_text
                else:
                    gap = segment.start - last_end
                    # If gap is large, treat as a new paragraph
                    if gap > 1.5:
                        result_text += "\n" + seg_text
                    else:
                        result_text += " " + seg_text
                
                last_end = segment.end
                
            print(json.dumps({"text": result_text.strip()}), flush=True)
        except Exception as e:
            print(json.dumps({"error": str(e)}), flush=True)

if __name__ == "__main__":
    main()
