#!/bin/bash
# DroidWhisper Configuration Script
# v31.0: Self-situating pathing
cd "$(dirname "$0")/.." || exit 1
# 1. System Dependencies (v30.0)
if command -v pacman &> /dev/null; then
    echo "Arch Linux detected. Ensuring system dependencies are met..."
    sudo pacman -S --needed --noconfirm wl-clipboard xclip scrcpy adb
elif command -v apt-get &> /dev/null; then
    echo "Debian/Ubuntu detected. Ensuring system dependencies are met..."
    sudo apt-get update && sudo apt-get install -y wl-clipboard xclip scrcpy adb
fi

# 2. Python & Node Environment
echo "Setting up AI Environment..."
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install
echo "Setup Complete!"
