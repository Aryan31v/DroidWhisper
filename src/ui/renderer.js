const { ipcRenderer } = require('electron');
const statusLabel = document.getElementById('status-label');
const contextIndicator = document.getElementById('context-indicator');
const historyBtn = document.getElementById('history-btn');
const modeText = document.getElementById('mode-text');
const modeToggle = document.getElementById('mode-toggle');
const pill = document.getElementById('pill');
const bars = document.querySelectorAll('.bar');

let currentMode = 'dictation';

// v18.0 Dynamic Pill Morphing Logic
const PILL_WIDTHS = {
    'READY': '210px',
    'RECORDING': '210px',
    'TRANSCRIBING': '300px',
    'POLISHING': '260px',
    'TYPING': '210px',
    'ERROR': '200px'
};

function setPillWidth(status) {
    const upper = status.toUpperCase();
    if (upper.includes('RECORDING')) {
        pill.style.width = PILL_WIDTHS['RECORDING'];
    } else if (upper.includes('READY')) {
        pill.style.width = PILL_WIDTHS['READY'];
    } else if (upper.includes('TRANSCRIBING')) {
        pill.style.width = PILL_WIDTHS['TRANSCRIBING'];
    } else if (upper.includes('POLISHING')) {
        pill.style.width = PILL_WIDTHS['POLISHING'];
    } else if (upper.includes('TYPING')) {
        pill.style.width = PILL_WIDTHS['TYPING'];
    } else {
        pill.style.width = PILL_WIDTHS['READY'];
    }
}

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    ipcRenderer.send('trigger-permission-probe');
});

ipcRenderer.send('mode-switch', currentMode);

modeToggle.addEventListener('click', () => {
    currentMode = currentMode === 'dictation' ? 'prompt' : 'dictation';
    modeText.innerText = currentMode === 'dictation' ? 'DICT' : 'PROMPT';
    modeToggle.classList.toggle('prompt-mode', currentMode === 'prompt');
    ipcRenderer.send('mode-switch', currentMode);
    setPillWidth('READY'); 
});

historyBtn.addEventListener('click', () => {
    ipcRenderer.send('retry-typing');
});

ipcRenderer.on('status-change', (event, status) => {
    statusLabel.innerText = status;
    const upperStatus = status.toUpperCase();
    
    // Handle Width Morphing
    setPillWidth(upperStatus);

    if (upperStatus.includes('RECORDING')) {
        const isPrompt = upperStatus.includes('PROMPT');
        pill.classList.add('recording');
        pill.style.borderColor = isPrompt ? 'var(--prompt-color)' : 'var(--accent-color)';
        pill.style.boxShadow = isPrompt 
            ? '0 0 20px rgba(168, 85, 247, 0.4)' 
            : '0 0 20px rgba(0, 242, 254, 0.4)';
    } else if (upperStatus.includes('READY')) {
        pill.classList.remove('recording');
        pill.style.borderColor = currentMode === 'prompt' ? 'var(--prompt-color)' : 'var(--accent-color)';
        pill.style.boxShadow = 'none';
        historyBtn.classList.add('active');
    } else if (upperStatus.includes('TYPING')) {
        historyBtn.classList.add('active');
    } else {
        pill.classList.remove('recording');
        pill.style.borderColor = 'var(--solid-border)';
        pill.style.boxShadow = 'none';
    }
});

ipcRenderer.on('context-captured', (event, captured) => {
    contextIndicator.style.opacity = captured ? '1' : '0';
});
