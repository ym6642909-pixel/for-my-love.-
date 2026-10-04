
// Optional ambient sound generated locally with Web Audio.
// No audio file or network request is required.

window.MuseumAudio = (() => {
  let context = null;
  let master = null;
  let oscillators = [];
  let enabled = false;

  function start() {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return false;

    context = context || new AudioContext();

    if (context.state === 'suspended') {
      context.resume();
    }

    master = context.createGain();
    master.gain.value = 0.0001;
    master.connect(context.destination);

    // Soft, low-volume harmonic ambience
    [110, 164.81, 220].forEach((frequency, index) => {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = index === 1 ? 'sine' : 'triangle';
      osc.frequency.value = frequency;

      gain.gain.value = index === 0 ? 0.12 : 0.055;

      osc.connect(gain);
      gain.connect(master);
      osc.start();

      oscillators.push(osc);
    });

    master.gain.setTargetAtTime(
      0.035,
      context.currentTime,
      1.2
    );

    return true;
  }

  function stop() {
    if (context && master) {
      master.gain.setTargetAtTime(
        0.0001,
        context.currentTime,
        0.35
      );
    }

    enabled = false;
  }

  function attach(button, label) {
    button.addEventListener('click', () => {
      if (!enabled) {
        if (!start()) {
          label.textContent = 'AUDIO UNAVAILABLE';
          return;
        }

        enabled = true;
        button.classList.add('on');
        button.setAttribute('aria-pressed', 'true');
        label.textContent = 'SOUND ON';
      } else {
        stop();
        button.classList.remove('on');
        button.setAttribute('aria-pressed', 'false');
        label.textContent = 'SOUND OFF';
      }
    });
  }

  return { attach };
})();
