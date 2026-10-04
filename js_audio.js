/**
 * EL COFRE QUE AÚN NO ABRIMOS — Módulo de Audio Ambiental (Web Audio API)
 * Genera texturas atmosféricas, notas armónicas de piano y campanillas doradas
 * de manera totalmente nativa y sin necesidad de descargas externas.
 */

class RomanticAudioManager {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.ambientGain = null;
    this.droneOsc = null;
    this.droneInterval = null;
    this.initContext();
  }

  initContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  async resume() {
    if (!this.ctx) this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  startAmbient() {
    if (this.isPlaying || !this.ctx) return;
    this.resume();
    this.isPlaying = true;

    // Master Ambient Gain
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.ambientGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 3);
    this.ambientGain.connect(this.ctx.destination);

    // Warm Low Ambient Drone (Frecuencias suaves de fondo)
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, this.ctx.currentTime);

    this.droneOsc.connect(filter);
    filter.connect(this.ambientGain);
    this.droneOsc.start();

    // Procedural Piano / Harp Sparkles (Notas armónicas en Escala Pentatónica menor/doriana)
    // D, F, G, A, C (440Hz base)
    const notes = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 659.25];
    
    this.droneInterval = setInterval(() => {
      if (!this.isPlaying || this.isMuted) return;
      // Tocar una nota suave cada pocos segundos
      if (Math.random() > 0.35) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        this.playSoftNote(note, 0.05, 3.5);
      }
    }, 2800);
  }

  playSoftNote(freq, volume = 0.05, duration = 3.0) {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio note error:', e);
    }
  }

  playChestOpening() {
    this.resume();
    // Sonido celestial de apertura de cerradura y brillo
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Suave click metálico
    const oscClick = this.ctx.createOscillator();
    const gainClick = this.ctx.createGain();
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(420, now);
    oscClick.frequency.exponentialRampToValueAtTime(140, now + 0.18);
    gainClick.gain.setValueAtTime(0.12, now);
    gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    oscClick.connect(gainClick);
    gainClick.connect(this.ctx.destination);
    oscClick.start(now);
    oscClick.stop(now + 0.2);

    // Resonancia de luz dorada ascendente
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => {
        this.playSoftNote(freq, 0.07, 3.2);
      }, i * 140);
    });
  }

  playHeartbeat() {
    this.resume();
    if (!this.ctx) return;
    // Dos pulsos profundos simulando el latido del corazón antes de la confesión
    const beat = (timeOffset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, this.ctx.currentTime + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + timeOffset + 0.25);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + timeOffset + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + timeOffset);
      osc.stop(this.ctx.currentTime + timeOffset + 0.4);
    };

    beat(0);
    beat(0.24);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ambientGain) {
      const targetGain = this.isMuted ? 0.00001 : 0.08;
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, this.ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.5);
    }
    return this.isMuted;
  }
}

window.romanticAudio = new RomanticAudioManager();