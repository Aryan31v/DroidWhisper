/**
 * orchestrator.js
 * Feature: Dictation
 * Manages the high-level dictation loop (Ready -> Recording -> Thinking -> Typing).
 */

const engine = require('./engine');
const intelligenceService = require('../AI/intelligenceService');
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
        console.error('WhisperFlow: Start failed:', err);
        stateService.broadcastChange(`ERROR: ${err.message}`);
        setTimeout(() => {
            stateService.broadcastChange('READY');
            stateService.setStatus({ isStarting: false });
        }, 3000);
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
            console.log('WhisperFlow: Stopping recording...');
            audioFile = await engine.stopRecording();
            
            if (!audioFile) {
                console.warn('WhisperFlow: No audio file generated.');
                return;
            }

            console.log(`WhisperFlow: Starting transcription for ${audioFile}...`);
            const result = await engine.transcribe(audioFile);
            
            if (!result || !result.text) {
                console.warn('WhisperFlow: Transcription resulted in empty text. Check device audio output.');
                stateService.broadcastChange('ERROR: No Audio Detected');
                setTimeout(() => {
                    stateService.broadcastChange('READY');
                    stateService.setStatus({ isStarting: false, isStopping: false });
                }, 2000);
                return;
            }

            console.log('WhisperFlow: Transcription successful. Handing to Brain...');
            stateService.broadcastChange('DROID THINKING');

            const finalOutput = await intelligenceService.processUserTask(result.text);

            if (finalOutput) {
                console.log('WhisperFlow: AI processing complete. Typing...');
                stateService.broadcastChange('TYPING');
                await typer.type(finalOutput);
            } else {
                console.warn('WhisperFlow: AI returned no output.');
            }
        } catch (err) {
            console.error('WhisperFlow: Processing pipeline failed:', err);
        } finally {
            if (audioFile && fs.existsSync(audioFile)) {
                try {
                    fs.unlinkSync(audioFile);
                } catch (e) {}
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
