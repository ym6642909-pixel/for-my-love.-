const AudioEngine = (() => {

  let ctx = null;
  let master = null;
  let ambientGain = null;

  let enabled = true;

  function init() {

    if (ctx) return;

    try {

      ctx = new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

      master = ctx.createGain();

      master.gain.value = enabled ? 0.035 : 0;

      master.connect(ctx.destination);

      ambientGain = ctx.createGain();

      ambientGain.gain.value = 0.15;

      ambientGain.connect(master);

      const oscillator = ctx.createOscillator();

      oscillator.type = "sine";
      oscillator.frequency.value = 110;

      const gain = ctx.createGain();

      gain.gain.value = 0.012;

      oscillator
        .connect(gain)
        .connect(ambientGain);

      oscillator.start();

    } catch (error) {
      console.warn("Audio no disponible:", error);
    }
  }


  function unlock() {

    init();

    if (
      ctx &&
      ctx.state === "suspended"
    ) {
      ctx.resume();
    }
  }


  function tone(
    frequency = 440,
    duration = 0.12,
    type = "sine"
  ) {

    if (!enabled) return;

    init();

    if (!ctx || !master) return;

    const oscillator =
      ctx.createOscillator();

    const gain =
      ctx.createGain();

    oscillator.type = type;

    oscillator.frequency.value =
      frequency;

    gain.gain.setValueAtTime(
      0.0001,
      ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.09,
      ctx.currentTime + 0.015
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + duration
    );

    oscillator
      .connect(gain)
      .connect(master);

    oscillator.start();

    oscillator.stop(
      ctx.currentTime +
      duration +
      0.02
    );
  }


  return {

    unlock,

    click() {
      tone(520, 0.08);
    },

    open() {

      tone(
        220,
        0.22,
        "triangle"
      );

      setTimeout(() => {
        tone(330, 0.3, "sine");
      }, 90);

    },

    reveal() {

      tone(660, 0.18);

      setTimeout(() => {
        tone(880, 0.35);
      }, 90);

    },

    setEnabled(value) {

      enabled = Boolean(value);

      if (master) {
        master.gain.value =
          enabled ? 0.035 : 0;
      }

    },

    isEnabled() {
      return enabled;
    }

  };

})();
