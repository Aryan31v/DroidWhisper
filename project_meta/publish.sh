#!/bin/bash
# DroidWhisper Hardened Publish Script (v9.0)
# v31.0: Self-situating pathing
cd "$(dirname "$0")/.." || exit 1
# Ensures personal data and secrets aren't accidentally committed.

echo -e "\n🛡️ DroidWhisper Security Audit..."

# 1. Check if .env is being tracked
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
    echo -e "❌ CRITICAL ERROR: .env is in the git index! Remove it: 'git rm --cached .env'"
    exit 1
fi

# 2. Check for large media or audio files
WAV_STAGED=$(git diff --cached --name-only | grep ".wav")
if [ ! -z "$WAV_STAGED" ]; then
    echo -e "❌ ERROR: You are trying to commit audio files (.wav). This violates privacy rules."
    exit 1
fi

# 3. Scan for accidentally staged local system paths (Anonymization check)
LOCAL_PATH_LEAK=$(git diff --cached | grep -E "/home/|/Users/|C:\\\\Users")
if [ ! -z "$LOCAL_PATH_LEAK" ]; then
    echo -e "⚠️ WARNING: Potential local system path detected in staged changes!"
    echo -e "$LOCAL_PATH_LEAK" | head -n 3
    read -p "Do you want to continue despite potential path leak? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Safety first. Commit aborted."
        exit 1
    fi
fi

echo -e "✅ Security pre-check passed."

# Ask for commit message
read -p "Enter commit message (Keep it generic/professional): " msg

if [ -z "$msg" ]; then
    msg="Refactor: codebase hardening and optimization"
fi

echo -e "\n📦 Safe Committing..."
git add .
git commit -m "$msg"

echo -e "\n🚀 Pushing to Secure Repository..."
git push origin main

echo -e "\n✨ Successfully Published."
