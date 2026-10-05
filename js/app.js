// Open and Close Letter Interaction
function openLetter() {
    const envelopeWrapper = document.querySelector('.envelope-wrapper');
    if (envelopeWrapper) {
        envelopeWrapper.classList.toggle('open');
    }
}

// Generate Dynamic Stars Canvas Background
function createStars() {
    const starsContainer = document.getElementById('stars-container');
    if (!starsContainer) return;

    const starCount = 80;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        
        // Random Position & Animation Styling
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2 + 1;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 3;

        star.style.position = 'absolute';
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.backgroundColor = '#ffffff';
        star.style.borderRadius = '50%';
        star.style.opacity = Math.random() * 0.7 + 0.3;
        star.style.boxShadow = `0 0 ${size * 2}px #ffffff`;
        star.style.animation = `twinkle ${duration}s infinite ease-in-out ${delay}s`;

        starsContainer.appendChild(star);
    }
}

// Keyframe animation for twinkling stars
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
@keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
}
`;
document.head.appendChild(styleSheet);

// Initialize App Features on Page Load
document.addEventListener('DOMContentLoaded', () => {
    createStars();
});
