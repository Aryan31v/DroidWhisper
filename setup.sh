#!/bin/bash
# DroidWhisper Configuration Script
echo "Setting up DroidWhisper..."
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install
echo "Setup Complete!"
