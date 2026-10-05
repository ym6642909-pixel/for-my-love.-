// Toggle Letter/Note Reveal State
function openLetter() {
    const ticket = document.querySelector('.interactive-ticket');
    const ticketStatus = document.querySelector('.ticket-status');
    
    if (ticket) {
        ticket.classList.toggle('revealed');
        
        if (ticket.classList.contains('revealed')) {
            ticketStatus.innerText = currentLang === 'es' ? 'REVELADO' : 'مكشوفة';
        } else {
            ticketStatus.innerText = translations[currentLang]['ticket-status'];
        }
    }
}

// Generate Subtle Ambient Stars Background
function createStars() {
    const starsContainer = document.getElementById('stars-container');
    if (!starsContainer) return;

    const starCount = 50;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 1.5 + 0.5;
        const duration = Math.random() * 4 + 3;
        const delay = Math.random() * 2;

        star.style.position = 'fixed';
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        star.style.borderRadius = '50%';
        star.style.animation = `twinkle ${duration}s infinite ease-in-out ${delay}s`;
        star.style.pointerEvents = 'none';

        starsContainer.appendChild(star);
    }
}

const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
@keyframes twinkle {
    0%, 100% { opacity: 0.1; transform: scale(0.8); }
    50% { opacity: 0.7; transform: scale(1.2); }
}
`;
document.head.appendChild(styleSheet);

document.addEventListener('DOMContentLoaded', () => {
    createStars();
});
