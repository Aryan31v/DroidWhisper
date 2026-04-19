/**
 * orchestrator.js
 * Feature: Dictation
 * Manages the high-level dictation loop (Ready -> Recording -> Thinking -> Typing).
 */

const engine = require('./engine');
const capture = require('../TextAwareness/capture');
const intelligenceService = require('../AI/intelligenceService');
const stateService = require('../../core/stateService');
const typer = require('../Interaction/typer');

const handleStart = async () => {
    const status = stateService.getStatus();
    if (status.isStarting || status.isStopping) return;

    stateService.setStatus({ isStarting: true });

    // 1. Silent context capture
    const selection = await capture.getPrimarySelection();
    const appInfo = await capture.getActiveWindowInfo();
    stateService.setStatus({ activeSelection: selection, activeApp: appInfo });

    try {
        stateService.broadcastChange('RECORDING');
        await engine.startRecording();
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

    setTimeout(async () => {
        try {
            const audioFile = await engine.stopRecording();
            if (!audioFile) return;

            const result = await engine.transcribe(audioFile);
            if (!result || !result.text) return;

            stateService.broadcastChange('DROID THINKING');

            // --- Agentic Intelligence (v27.0) ---
            // Everything is processed with 'Freedom' and Context Awareness
            const currentStatus = stateService.getStatus();
            const finalOutput = await intelligenceService.processUserTask(
                result.text, 
                currentStatus.activeSelection, 
                currentStatus.activeApp
            );

            if (finalOutput) {
                stateService.broadcastChange('TYPING');
                await typer.type(finalOutput);
            }
        } catch (err) {
            console.error('Dictation: Stop/Process failed:', err);
        } finally {
            stateService.broadcastChange('READY');
            stateService.setStatus({ 
                isStarting: false, 
                isStopping: false, 
                activeSelection: '' 
            });
        }
    }, 100);
};

module.exports = {
    handleStart,
    handleStop
};
