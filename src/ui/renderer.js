const { ipcRenderer } = require('electron');
const statusLabel = document.getElementById('status-label');
const pill = document.getElementById('pill');
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



ipcRenderer.on('status-change', (event, status) => {
    statusLabel.innerText = status;
    const upperStatus = status.toUpperCase();

    // Handle Width Morphing
    setPillWidth(upperStatus);

    if (upperStatus.includes('RECORDING')) {
        pill.classList.add('recording');
        pill.style.borderColor = 'var(--accent-color)';
        pill.style.boxShadow = `0 0 20px rgba(35, 187, 146, 0.4)`; // var(--accent-color)
    } else if (upperStatus.includes('DROID')) {
        // "DROID THINKING" state
        pill.classList.remove('recording');
        pill.style.borderColor = 'var(--prompt-color)';
        pill.style.boxShadow = `0 0 25px rgba(168, 85, 247, 0.5)`;
    } else if (upperStatus.includes('READY')) {
        pill.classList.remove('recording');
        pill.style.borderColor = 'var(--accent-color)';
        pill.style.boxShadow = 'none';
        // appLabel.innerText = 'WATCHING: NONE'; // Keep last app visible or let monitor update it
        
        // Re-sync icon with monitor's last known state if needed
        // (The next monitor pulse will restore it if selection is still active)
    } else if (upperStatus.includes('TYPING')) {
        // Typing status logic
    } else {
        pill.classList.remove('recording');
        pill.style.borderColor = 'var(--solid-border)';
        pill.style.boxShadow = 'none';
        
    }
});


