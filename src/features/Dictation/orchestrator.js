/**
 * orchestrator.js
 * Feature: Dictation
 * Manages the high-level dictation loop (Ready -> Recording -> Thinking -> Typing).
 */

const engine = require('./engine');
const intelligenceService = require('../AI/intelligenceService');
const intentService = require('../Interaction/intentService');
const stateService = require('../../core/stateService');
const typer = require('../Interaction/typer');
const fs = require('fs');
const path = require('path');

const handleStart = async () => {
    const status = stateService.getStatus();
    if (status.isStarting || status.isStopping || !status.isServiceReady) {
        if (!status.isServiceReady) console.warn('Dictation: Service not ready yet.');
        return;
    }

    stateService.setStatus({ isStarting: true });

    // 1. No Context Capture (Fully Blind Mode)
    stateService.setStatus({ isStarting: true });

    try {
        await engine.startRecording();
        stateService.broadcastChange('RECORDING');
    } catch (err) {
        console.error('Dictation: Start failed:', err);
        stateService.broadcastChange('READY');
        stateService.setStatus({ isStarting: false });
    }
};

const handleStop = async () => {
    const status = stateService.getStatus();
    if (status.isStopping || !status.isStarting) return;

    stateService.setStatus({ isStopping: true });
    stateService.broadcastChange('TRANSCRIBING');

    let audioFile = null;
    setTimeout(async () => {
        try {
            audioFile = await engine.stopRecording();
            if (!audioFile) return;

            const result = await engine.transcribe(audioFile);
            if (!result || !result.text) return;

            // --- Intent Detection (v30.0) ---
            const { intent, cleanedText, isCommand } = intentService.detectIntent(result.text);
            
            // Broadcast specialized identity glows
            if (intent === 'rephrase') stateService.broadcastChange('DROID THINKING');
            else if (intent === 'transform') stateService.broadcastChange('CRAFTING');
            else stateService.broadcastChange('TRANSCRIBING');

            // --- High-Fidelity Two-Pass AI ---
            const finalOutput = await intelligenceService.processUserTask(
                result.text,
                intent
            );

            if (finalOutput) {
                stateService.broadcastChange('TYPING');
                await typer.type(finalOutput);
            }
        } catch (err) {
            console.error('Dictation: Stop/Process failed:', err);
        } finally {
            // New: Managed Cleanup for Unique Recording Files (v29.1)
            if (audioFile && fs.existsSync(audioFile)) {
                try {
                    fs.unlinkSync(audioFile);
                    console.log(`Dictation: Cleaned up session file: ${path.basename(audioFile)}`);
                } catch (e) {
                    console.error('Dictation: Cleanup failed:', e);
                }
            }

            stateService.broadcastChange('READY');
            stateService.setStatus({ 
                isStarting: false, 
                isStopping: false 
            });
        }
    }, 100);
};

module.exports = {
    handleStart,
    handleStop
};
