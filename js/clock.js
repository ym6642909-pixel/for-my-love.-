function updateClocks() {
    const now = new Date();

    // Cairo Time (UTC+2 / Africa/Cairo)
    try {
        const cairoTimeString = now.toLocaleTimeString('en-US', {
            timeZone: 'Africa/Cairo',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const cairoElement = document.getElementById('cairo-clock');
        if (cairoElement) cairoElement.innerText = cairoTimeString;
    } catch (e) {
        console.error("Cairo Clock Error:", e);
    }

    // Tegucigalpa Time (UTC-6 / America/Tegucigalpa)
    try {
        const teguTimeString = now.toLocaleTimeString('en-US', {
            timeZone: 'America/Tegucigalpa',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const teguElement = document.getElementById('tegu-clock');
        if (teguElement) teguElement.innerText = teguTimeString;
    } catch (e) {
        console.error("Tegu Clock Error:", e);
    }
}

// Start Clock when page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    updateClocks();
    setInterval(updateClocks, 1000);
});
