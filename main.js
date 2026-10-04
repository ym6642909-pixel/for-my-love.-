
(() => {
  const scenes = [...document.querySelectorAll('.scene')];
  const dots = [...document.querySelectorAll('.progress-dot')];
  const modal = document.getElementById('thoughtModal');
  const modalText = document.getElementById('modalText');
  const pathResponse = document.getElementById('pathResponse');
  const answerResult = document.getElementById('answerResult');
  let current = 'welcome';

  const responses = {
    friendship: 'A lovely place to begin. The best connections have room to grow in their own time.',
    memories: 'Then may there be many small moments worth remembering, one at a time.',
    unknown: 'A little openness to possibility can be a beautiful thing. No need to know the ending yet.'
  };

  const answers = {
    yes: 'That makes me happy. Let’s take the next chapter one honest moment at a time. ✨',
    time: 'Of course. We can take our time, with no pressure and no expectations. 🌷',
    friend: 'Thank you for being honest with me. I value you and respect how you feel. 🤍'
  };

  function showScene(id) {
    if (!scenes.some(scene => scene.id === id)) return;

    current = id;

    scenes.forEach(scene => {
      scene.classList.toggle('active', scene.id === id);
    });

    dots.forEach(dot => {
      const active = dot.dataset.scene === id;
      dot.classList.toggle('current', active);

      if (active) {
        dot.setAttribute('aria-current', 'step');
      } else {
        dot.removeAttribute('aria-current');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Navigate between scenes
  document.querySelectorAll('[data-next]').forEach(button => {
    button.addEventListener('click', () => {
      showScene(button.dataset.next);
    });
  });

  // Navigation dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      showScene(dot.dataset.scene);
    });
  });

  // Open thought cards
  document.querySelectorAll('.thought-card').forEach(card => {
    card.addEventListener('click', () => {
      modalText.textContent = card.dataset.thought;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.querySelector('.modal-close').focus();
    });
  });

  // Close modal
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  modal.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', closeModal);
  });

  // Keyboard navigation
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }

    if (event.key === 'ArrowRight' && !modal.classList.contains('open')) {
      const index = scenes.findIndex(scene => scene.id === current);

      if (index < scenes.length - 1) {
        showScene(scenes[index + 1].id);
      }
    }

    if (event.key === 'ArrowLeft' && !modal.classList.contains('open')) {
      const index = scenes.findIndex(scene => scene.id === current);

      if (index > 0) {
        showScene(scenes[index - 1].id);
      }
    }
  });

  // Garden choices
  document.querySelectorAll('.path-choice').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.path-choice').forEach(item => {
        item.classList.remove('selected');
      });

      button.classList.add('selected');
      pathResponse.textContent = responses[button.dataset.path];
    });
  });

  // Final answers
  document.querySelectorAll('[data-answer]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-answer]').forEach(item => {
        item.classList.remove('chosen');
      });

      button.classList.add('chosen');
      answerResult.textContent = answers[button.dataset.answer];
    });
  });

  // Restart experience
  document.getElementById('restart').addEventListener('click', () => {
    pathResponse.textContent = '';
    answerResult.textContent = '';

    document.querySelectorAll('.selected, .chosen').forEach(item => {
      item.classList.remove('selected', 'chosen');
    });

    showScene('welcome');
  });

  // Sound controller
  window.MuseumAudio?.attach(
    document.getElementById('soundToggle'),
    document.getElementById('soundLabel')
  );

  // Start at entrance
  showScene('welcome');
})();
