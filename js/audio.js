/**
 * Audio Manager utilizing Web Audio API for synthesized ambient sound
 * avoiding reliance on missing external audio assets.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = true;
    this.oscillator = null;
    this.gainNode = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  toggleMusic() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    
    if (!this.isMuted) {
      this.startAmbientTone();
    } else {
      this.stopAmbientTone();
    }
    
    localStorage.setItem('dacia_box_audio', this.isMuted ? 'OFF' : 'ON');
    return !this.isMuted;
  }

  startAmbientTone() {
    if (!this.ctx) return;
    try {
      this.oscillator = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();

      // Soft warm ambient low pitch frequency (Soft synth simulation)
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(108, this.ctx.currentTime); // Deep warm note A2

      this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.05, this.ctx.currentTime + 3);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.oscillator.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn("Audio playback non-fatal warning", e);
    }
  }

  stopAmbientTone() {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
      setTimeout(() => {
        if (this.oscillator) this.oscillator.stop();
        this.isPlaying = false;
      }, 1000);
    }
  }

  playLockClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch(e) {}
  }
}

window.audioManager = new AudioManager();
