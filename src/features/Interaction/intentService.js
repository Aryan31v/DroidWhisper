/**
 * intentService.js
 * Analyzes raw transcriptions to determine if the user is giving a command 
 * or just dictating text.
 */

const COMMAND_KEYWORDS = {
    rephrase: [
        'make this',
        'professional',
        'natural',
        'better',
        'correct',
        'rephrase',
        'eloquent'
    ],
    transform: [
        'turn this into',
        'bullets',
        'summary',
        'action items',
        'reformat',
        'list'
    ],
    literal: [
        'just transcribe',
        'don\'t change any',
        'don\'t do anything',
        'literal',
        'exactly as i say',
        'transcribe this'
    ]
};

const AGENT_NAME = 'droid';

/**
 * Normalizes text for intent detection.
 * @param {string} text - Raw transcription.
 * @returns {Object} { intent: 'dictate'|'rephrase'|'transform', cleanedText: string, isCommand: boolean }
 */
const detectIntent = (text) => {
    if (!text) return { intent: 'dictate', cleanedText: '', isCommand: false };

    const lower = text.toLowerCase();
    
    // Check for explicit "Droid" trigger
    const triggerRegex = new RegExp(`^(hey\\s+)?${AGENT_NAME}[,\\s]*`, 'i');
    const hasTrigger = triggerRegex.test(lower);
    
    let cleanedText = text;
    if (hasTrigger) {
        cleanedText = text.replace(triggerRegex, '').trim();
    }

    if (!cleanedText) return { intent: 'dictate', cleanedText: '', isCommand: true };

    const lowerCleaned = cleanedText.toLowerCase();

    // v26.0: Basic Keyword Mapping
    const commands = {
        transform: ['bullets', 'list', 'summary', 'summarize', 'action items'],
        rephrase: ['make this', 'professional', 'natural', 'rephrase', 'eloquent']
    };

    if (commands.transform.some(kw => lowerCleaned.includes(kw))) {
        return { intent: 'transform', cleanedText, isCommand: true };
    }

    if (commands.rephrase.some(kw => lowerCleaned.includes(kw))) {
        return { intent: 'rephrase', cleanedText, isCommand: true };
    }

    return { 
        intent: 'dictate', 
        cleanedText: cleanedText, 
        isCommand: hasTrigger 
    };
};

module.exports = {
    detectIntent
};
