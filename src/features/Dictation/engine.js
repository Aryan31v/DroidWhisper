/**
 * engine.js
 * Feature: Dictation
 * Core recording and transcription engine.
 */

const scrcpyManager = require('./scrcpyManager');
const transcriptionBridge = require('./transcriptionBridge');

/**
 * Starts the audio recording.
 */
const startRecording = async () => {
    return await scrcpyManager.startRecording();
};

/**
 * Stops the recording and returns the file path.
 */
const stopRecording = async () => {
    return await scrcpyManager.stopRecording();
};

/**
 * Transcribes an audio file.
 */
const transcribe = async (audioPath) => {
    return await transcriptionBridge.transcribe(audioPath);
};

module.exports = {
    startRecording,
    stopRecording,
    transcribe
};
