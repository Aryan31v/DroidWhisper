"""
whisperBackend.py
Local Faster-Whisper transcription service with Global Hotkey support.
Provides: Global hotkey listening (Alt+CapsLock) with debounce for Linux key-repeat.
Dependencies: faster-whisper, pynput.
Used by: transcriptionBridge.js.
"""

import sys
import os
import json
import threading
import time
from faster_whisper import WhisperModel
from pynput import keyboard

# State management
is_recording = False
pressed_keys = set()
last_release_time = 0

def on_press(key, signal_start):
    global is_recording
    pressed_keys.add(key)
    
    # Check for Alt + CapsLock
    has_alt = any(k in (keyboard.Key.alt, keyboard.Key.alt_l, keyboard.Key.alt_r) for k in pressed_keys)
    has_caps = keyboard.Key.caps_lock in pressed_keys
    
    if (has_alt and has_caps) or (key == keyboard.Key.f8):
        if not is_recording:
            is_recording = True
            signal_start()

def on_release(key, signal_stop):
    global is_recording, last_release_time
    if key in pressed_keys:
        pressed_keys.remove(key)
    
    # Debounce for Linux Key Repeat
    # We wait a tiny bit to see if it's just a repeat-release
    def delayed_check():
        global is_recording
        time.sleep(0.05) # 50ms debounce
        
        has_alt = any(k in (keyboard.Key.alt, keyboard.Key.alt_l, keyboard.Key.alt_r) for k in pressed_keys)
        has_caps = keyboard.Key.caps_lock in pressed_keys
        
        if not (has_alt and has_caps):
            if is_recording:
                is_recording = False
                signal_stop()

    threading.Thread(target=delayed_check, daemon=True).start()

def start_hotkey_listener(callback_start, callback_stop):
    def _on_press(key):
        on_press(key, callback_start)
            
    def _on_release(key):
        on_release(key, callback_stop)

    listener = keyboard.Listener(on_press=_on_press, on_release=_on_release)
    listener.start()

def main():
    # Configuration
    model_size = os.getenv("WHISPER_MODEL", "base.en")
    device = os.getenv("WHISPER_DEVICE", "cpu")
    compute_type = "int8" if device == "cpu" else "float16"

    # Be very explicit about loading
    print(f"DEBUG: Initializing faster-whisper model '{model_size}'...", file=sys.stderr)
    
    try:
        # This will download the model if not present
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

    # IPC loop for manual transcription requests
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
            segments, info = model.transcribe(audio_path, beam_size=5)
            text = " ".join([segment.text for segment in segments]).strip()
            print(json.dumps({"text": text}), flush=True)
        except Exception as e:
            print(json.dumps({"error": str(e)}), flush=True)

if __name__ == "__main__":
    main()
