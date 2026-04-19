#!/bin/bash
# DroidWhisper Quick Launch Script
# v31.0: Self-situating pathing
cd "$(dirname "$0")/.." || exit 1

# Ensure NVM path is set for this session if needed
export PATH="/home/cryponic/.nvm/versions/node/v24.13.1/bin:$PATH"

echo "🚀 Launching DroidWhisper..."
npm start
