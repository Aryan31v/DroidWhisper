const { ipcRenderer } = require('electron');
const statusLabel = document.getElementById('status-label');
const contextIndicator = document.getElementById('context-indicator');
const historyBtn = document.getElementById('history-btn');
const pill = document.getElementById('pill');
const appLabel = document.getElementById('app-name-label');
const bars = document.querySelectorAll('.bar');

// v18.0 Dynamic Pill Morphing Logic
const PILL_WIDTHS = {
    'READY': '210px',
    'RECORDING': '210px',
    'TRANSCRIBING': '300px',
    'POLISHING': '260px',
    'DROID': '280px',
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
    } else if (upper.includes('POLISHING') || upper.includes('DROID')) {
        pill.style.width = PILL_WIDTHS['DROID'];
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

historyBtn.addEventListener('click', () => {
    ipcRenderer.send('retry-typing');
});

ipcRenderer.on('status-change', (event, status) => {
    statusLabel.innerText = status;
    const upperStatus = status.toUpperCase();

    // Handle Width Morphing
    setPillWidth(upperStatus);

    if (upperStatus.includes('RECORDING')) {
        pill.classList.add('recording');
        pill.style.borderColor = 'var(--accent-color)';
        pill.style.boxShadow = `0 0 20px rgba(35, 187, 146, 0.4)`; // var(--accent-color)
        contextIndicator.classList.remove('visible'); // Force hide during recording
    } else if (upperStatus.includes('DROID')) {
        // "DROID THINKING" state
        pill.classList.remove('recording');
        pill.style.borderColor = 'var(--prompt-color)';
        pill.style.boxShadow = `0 0 25px rgba(168, 85, 247, 0.5)`;
        contextIndicator.classList.remove('visible'); // Force hide while AI is thinking
    } else if (upperStatus.includes('READY')) {
        pill.classList.remove('recording');
        pill.style.borderColor = 'var(--accent-color)';
        pill.style.boxShadow = 'none';
        historyBtn.classList.add('active');
        // appLabel.innerText = 'WATCHING: NONE'; // Keep last app visible or let monitor update it
        
        // Re-sync icon with monitor's last known state if needed
        // (The next monitor pulse will restore it if selection is still active)
    } else if (upperStatus.includes('TYPING')) {
        historyBtn.classList.add('active');
        contextIndicator.classList.remove('visible'); // Hide during simulated typing
    } else {
        pill.classList.remove('recording');
        pill.style.borderColor = 'var(--solid-border)';
        pill.style.boxShadow = 'none';
        contextIndicator.classList.remove('visible');
    }
});

ipcRenderer.on('context-captured', (event, data) => {
    if (data.captured) {
        contextIndicator.classList.add('visible');
    } else {
        contextIndicator.classList.remove('visible');
    }
    
    if (data.app) {
        appLabel.innerText = `WATCHING: ${data.app.toUpperCase()}`;
    }
});
