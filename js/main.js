/**
 * Main Interactive Logic & Canvas Particle Rendering
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Particle Canvas Engine Setup
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedY = -(Math.random() * 0.3 + 0.1);
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.y += this.speedY;
      if (this.y < 0) this.reset();
    }
    draw() {
      ctx.fillStyle = `rgba(243, 223, 165, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < 40; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // 2. Custom Desktop Cursor Tracking
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (window.innerWidth > 1024) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      follower.style.left = `${e.clientX}px`;
      follower.style.top = `${e.clientY}px`;
    });

    document.querySelectorAll('button, .artifact-card, .svg-chest-container').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
  }

  // 3. Audio UI Control Toggle
  const musicBtn = document.getElementById('music-toggle');
  const musicText = musicBtn.querySelector('.music-text');
  musicBtn.addEventListener('click', () => {
    const active = window.audioManager.toggleMusic();
    musicText.textContent = active ? 'ON' : 'OFF';
  });

  // 4. Initial Loader Sequence
  setTimeout(() => {
    document.getElementById('loader-text').textContent = 'Listo.';
    setTimeout(() => {
      window.sceneManager.showScene('scene-darkness');
    }, 800);
  }, 1800);

  // 5. Scene 1 Interactions
  const chestTrigger = document.getElementById('chest-trigger');
  const btnOpenChest = document.getElementById('btn-open-chest');

  function openChestSequence() {
    window.audioManager.playLockClick();
    chestTrigger.classList.add('chest-open');
    setTimeout(() => {
      window.sceneManager.showScene('scene-letter');
      // Start typing letter line 1
      window.sceneManager.typeWriter('letter-line-1', 'Antes de conocerte,\nmi mundo era mucho más silencioso.', 45, () => {
        setTimeout(() => {
          window.sceneManager.typeWriter('letter-line-2', 'Y entonces apareciste tú.', 50, () => {
            document.getElementById('btn-to-items').classList.remove('hidden');
          });
        }, 1000);
      });
    }, 1200);
  }

  btnOpenChest.addEventListener('click', openChestSequence);
  chestTrigger.addEventListener('click', openChestSequence);

  // 6. Scene 2 to Scene 3
  document.getElementById('btn-to-items').addEventListener('click', () => {
    window.sceneManager.showScene('scene-items');
    window.sceneManager.checkSecretoUnlock();
  });

  // 7. Artifact Cards / Items Modal Logic
  const artifactCards = document.querySelectorAll('.artifact-card');
  const modalScene = document.getElementById('modal-item');
  const itemDetails = document.querySelectorAll('.item-detail');
  const btnCloseModal = document.getElementById('btn-close-modal');

  artifactCards.forEach(card => {
    card.addEventListener('click', () => {
      const item = card.getAttribute('data-item');

      if (item === 'secreto' && !window.sceneManager.checkSecretoUnlock()) {
        return; // Locked state
      }

      // Hide all details & show active item detail
      itemDetails.forEach(d => d.classList.add('hidden'));
      const activeDetail = document.getElementById(`content-${item}`);
      if (activeDetail) activeDetail.classList.remove('hidden');

      if (item === 'secreto') {
        btnCloseModal.classList.add('hidden');
      } else {
        btnCloseModal.classList.remove('hidden');
        window.sceneManager.markItemVisited(item);
      }

      modalScene.classList.add('active');
    });
  });

  btnCloseModal.addEventListener('click', () => {
    modalScene.classList.remove('active');
  });

  // 8. Secreto -> Confession Transition
  document.getElementById('btn-reveal-confession').addEventListener('click', () => {
    modalScene.classList.remove('active');
    window.sceneManager.showScene('scene-confession-prelude');

    setTimeout(() => {
      document.getElementById('confession-step-1').classList.add('hidden');
      document.getElementById('confession-step-2').classList.remove('hidden');
    }, 2500);
  });

  // 9. Confession Prelude -> Main Letter Reveal
  document.getElementById('btn-yes-confession').addEventListener('click', () => {
    window.sceneManager.showScene('scene-main-letter');

    // Reveal main letter paragraphs line by line
    const lines = document.querySelectorAll('.letter-body .letter-line');
    lines.forEach((line, idx) => {
      setTimeout(() => {
        line.classList.add('visible');
        if (idx === lines.length - 1) {
          document.getElementById('btn-to-surprise').classList.remove('hidden');
        }
      }, (idx + 1) * 1800);
    });
  });

  // 10. Main Letter -> Future Scene
  document.getElementById('btn-to-surprise').addEventListener('click', () => {
    window.sceneManager.showScene('scene-future');
  });

  // 11. Future Scene -> Interactive Ending
  document.getElementById('btn-to-ending').addEventListener('click', () => {
    window.sceneManager.showScene('scene-ending');
  });

  // 12. Final Choices
  const choiceYes = document.getElementById('btn-choice-yes');
  const choiceMaybe = document.getElementById('btn-choice-maybe');
  const epilogueLayer = document.getElementById('final-starry-epilogue');

  function triggerFinalEpilogue() {
    epilogueLayer.classList.remove('hidden');
  }

  choiceYes.addEventListener('click', triggerFinalEpilogue);
  choiceMaybe.addEventListener('click', triggerFinalEpilogue);

  // Restart Story
  document.getElementById('btn-restart').addEventListener('click', () => {
    epilogueLayer.classList.add('hidden');
    window.sceneManager.showScene('scene-darkness');
  });
});
