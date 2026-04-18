#!/bin/bash
# DroidWhisper Safe Publish Script
# Ensures secrets aren't accidentally committed before pushing.

echo -e "\n🔍 Checking for sensitive files..."

# Double check if .env is being tracked
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
    echo -e "❌ ERROR: .env is being tracked by Git! Run 'git rm --cached .env' first."
    exit 1
fi

# Check for large wav files being tracked
if git ls-files | grep ".wav" >/dev/null 2>&1; then
    echo -e "❌ ERROR: .wav files are being tracked! Check your .gitignore."
    exit 1
fi

echo -e "✅ Security check passed."

# Ask for commit message
read -p "Enter commit message: " msg

if [ -z "$msg" ]; then
    msg="Update DroidWhisper"
fi

echo -e "\n📦 Committing changes..."
git add .
git commit -m "$msg"

echo -e "\n🚀 Pushing to GitHub..."
git push origin main

echo -e "\n✨ Done!"
