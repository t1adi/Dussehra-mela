/**
 * AudioManager - Comprehensive Spatialized Procedural Audio Engine
 * Combines authentic Indian festive instrumental music, Dholak rhythms,
 * spatialized mela crowd murmur, food stall sizzle, Ferris wheel hum, and sound effects.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  private isEnabled = true;
  private isMusicPlaying = false;
  private musicTimer: number | null = null;

  // Volume settings
  private masterVolume = 0.8;
  private sfxVolume = 0.85;
  private musicVolume = 0.55;
  private ambienceVolume = 0.65;

  // Procedural Noise Buffer
  private noiseBuffer: AudioBuffer | null = null;

  // Ambience Beds
  private crowdBed: { source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
  private crowdUpperBed: { source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
  private foodBed: { source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
  private wheelBed: { source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } | null = null;

  // Dholak Rhythm State
  private beat = 0;
  private nextBeatTime = 0;
  private dholakTimer: number | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) {
          this.ctx.suspend().catch(() => {});
        } else if (this.isEnabled) {
          this.ctx.resume().catch(() => {});
        }
      });
    }
  }

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    this.ctx = ctx;

    // Master Compressor to prevent clipping and give professional polish
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -14;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 4.5;
    this.compressor.connect(ctx.destination);

    // Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.masterVolume;
    this.masterGain.connect(this.compressor);

    // SFX Bus
    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    this.sfxGain.connect(this.masterGain);

    // Music Bus
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = this.musicVolume;
    this.musicGain.connect(this.masterGain);

    // Ambience Bus
    this.ambienceGain = ctx.createGain();
    this.ambienceGain.gain.value = this.ambienceVolume;
    this.ambienceGain.connect(this.masterGain);

    // Generate 3.5-second looping noise buffer for crowd and textures
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * 3.5);
    this.noiseBuffer = ctx.createBuffer(1, length, sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      // Brown/Pink smoothed noise
      last = (last + (Math.random() * 2 - 1) * 0.08) / 1.08;
      data[i] = last * 3.2;
    }

    // Start Ambience Beds
    this.startAmbienceBeds();
    // Start Dholak Rhythm Loop
    this.startDholakLoop();
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private createBed(type: BiquadFilterType, freq: number, q: number, bus: GainNode) {
    if (!this.ctx || !this.noiseBuffer) return null;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.001;

    source.connect(filter).connect(gain).connect(bus);
    source.start(0, Math.random() * 2);
    return { source, filter, gain };
  }

  private startAmbienceBeds() {
    if (!this.ctx || !this.ambienceGain) return;
    this.crowdBed = this.createBed('bandpass', 720, 0.7, this.ambienceGain);
    this.crowdUpperBed = this.createBed('bandpass', 1420, 1.4, this.ambienceGain);
    this.foodBed = this.createBed('highpass', 2400, 0.6, this.ambienceGain);
    this.wheelBed = this.createBed('lowpass', 160, 0.8, this.ambienceGain);

    if (this.crowdBed) this.crowdBed.gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    if (this.crowdUpperBed) this.crowdUpperBed.gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    if (this.foodBed) this.foodBed.gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    if (this.wheelBed) this.wheelBed.gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
  }

  // --- Spatial Ambience Update ---
  public updateSpatialAmbience(playerPos: [number, number, number]) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;

    // Modulate crowd murmur subtly over time
    if (this.crowdBed) {
      const freq = 680 + Math.sin(t * 0.45) * 160;
      this.crowdBed.filter.frequency.setTargetAtTime(freq, t, 0.4);
      const amp = 0.16 + Math.sin(t * 0.8) * 0.04;
      this.crowdBed.gain.gain.setTargetAtTime(amp, t, 0.4);
    }

    if (this.crowdUpperBed) {
      const freq = 1350 + Math.sin(t * 0.3) * 280;
      this.crowdUpperBed.filter.frequency.setTargetAtTime(freq, t, 0.4);
    }

    // Food sizzle louder near food stalls (around x = -10, z = 0)
    if (this.foodBed) {
      const distToFood = Math.hypot(playerPos[0] - (-10), playerPos[2] - 0);
      const foodLevel = 0.15 / (1 + (distToFood / 8) ** 2);
      this.foodBed.gain.gain.setTargetAtTime(0.02 + foodLevel, t, 0.3);
    }

    // Ferris Wheel hum louder near wheel (around x = 14, z = -28)
    if (this.wheelBed) {
      const distToWheel = Math.hypot(playerPos[0] - 14, playerPos[2] - (-28));
      const wheelLevel = 0.18 / (1 + (distToWheel / 10) ** 2);
      this.wheelBed.gain.gain.setTargetAtTime(0.03 + wheelLevel, t, 0.3);
    }
  }

  // --- Authentic Indian Dholak Rhythm ---
  private startDholakLoop() {
    const tickDholak = () => {
      if (!this.ctx || this.ctx.state !== 'running' || !this.isEnabled) {
        this.dholakTimer = window.setTimeout(tickDholak, 100);
        return;
      }

      const t = this.ctx.currentTime;
      if (t >= this.nextBeatTime) {
        const isBass = this.beat % 4 === 0 || this.beat % 4 === 2;
        this.playDholBeat(isBass, t);

        this.beat++;
        const swing = (this.beat % 4 === 3) ? 0.22 : 0.32;
        this.nextBeatTime = t + swing;
      }

      this.dholakTimer = window.setTimeout(tickDholak, 40);
    };

    tickDholak();
  }

  private playDholBeat(isBass: boolean, time: number) {
    if (!this.ctx || !this.ambienceGain) return;

    if (isBass) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(115, time);
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.2);

      gain.gain.setValueAtTime(0.24, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      osc.connect(gain).connect(this.ambienceGain);
      osc.start(time);
      osc.stop(time + 0.23);
    }

    const trebleOsc = this.ctx.createOscillator();
    const trebleGain = this.ctx.createGain();
    trebleOsc.type = 'triangle';
    trebleOsc.frequency.setValueAtTime(isBass ? 280 : 340, time);
    trebleOsc.frequency.exponentialRampToValueAtTime(160, time + 0.08);

    trebleGain.gain.setValueAtTime(0.14, time);
    trebleGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    trebleOsc.connect(trebleGain).connect(this.ambienceGain);
    trebleOsc.start(time);
    trebleOsc.stop(time + 0.1);
  }

  // --- Volume Controls ---
  public setMuted(muted: boolean) {
    this.isEnabled = !muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
  }

  public setMasterVolume(val: number) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && this.isEnabled) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setAmbienceVolume(val: number) {
    this.ambienceVolume = Math.max(0, Math.min(1, val));
    if (this.ambienceGain && this.ctx) {
      this.ambienceGain.gain.setValueAtTime(this.ambienceVolume, this.ctx.currentTime);
    }
  }

  // --- Sound Effects ---
  public playPop() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playRingThrow() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.16);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playRingHit(success: boolean) {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    if (success) {
      [587.33, 880, 1174.66].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);

        gain.gain.setValueAtTime(0.4, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.65);

        osc.connect(gain).connect(this.sfxGain!);
        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.65);
      });
    } else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain).connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  public playBell() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const harmonics = [440, 880, 1320, 1760, 2200];
    harmonics.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 4 - 2), t);

      const amp = 0.35 / (i + 1);
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0 - i * 0.2);

      osc.connect(gain).connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 2.0);
    });
  }

  public playConch() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(293.66, t + 0.6);
    osc.frequency.linearRampToValueAtTime(329.63, t + 1.4);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, t);
    filter.Q.value = 4;

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.55, t + 0.3);
    gain.gain.setValueAtTime(0.55, t + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);

    osc.connect(filter).connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 2.4);
  }

  public playEatSnack() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const time = t + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180 + Math.random() * 80, time);
      osc.frequency.exponentialRampToValueAtTime(50, time + 0.05);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

      osc.connect(gain).connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.05);
    }
  }

  public playToySound(type: string) {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    if (type === 'lattu') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.linearRampToValueAtTime(170, t + 1.3);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);

      osc.connect(gain).connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.3);
    } else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, t);
      osc.frequency.linearRampToValueAtTime(783.99, t + 0.12);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain).connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  public playFirework() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const whistle = this.ctx.createOscillator();
    const whistleGain = this.ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(360, t);
    whistle.frequency.exponentialRampToValueAtTime(1500, t + 0.45);

    whistleGain.gain.setValueAtTime(0.2, t);
    whistleGain.gain.linearRampToValueAtTime(0.01, t + 0.45);

    whistle.connect(whistleGain).connect(this.sfxGain);
    whistle.start(t);
    whistle.stop(t + 0.45);

    const boomTime = t + 0.42;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.9);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.28));
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const lowFilter = this.ctx.createBiquadFilter();
    lowFilter.type = 'lowpass';
    lowFilter.frequency.setValueAtTime(380, boomTime);
    lowFilter.frequency.linearRampToValueAtTime(60, boomTime + 0.8);

    const boomGain = this.ctx.createGain();
    boomGain.gain.setValueAtTime(0.95, boomTime);
    boomGain.gain.exponentialRampToValueAtTime(0.001, boomTime + 0.85);

    noiseSource.connect(lowFilter).connect(boomGain).connect(this.sfxGain);
    noiseSource.start(boomTime);
  }

  public playCheer() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 2.5);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1);
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1150, t);
    filter.Q.value = 1.3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.35);
    gain.gain.setValueAtTime(0.4, t + 1.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

    noiseSource.connect(filter).connect(gain).connect(this.sfxGain);
    noiseSource.start(t);
  }

  public playClick() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // --- Authentic Festive Indian Bansuri & Tanpura Instrumental Soundtrack ---
  public startBackgroundMusic() {
    if (this.isMusicPlaying) return;
    this.resume();
    this.isMusicPlaying = true;

    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];

    // Tanpura Drone
    if (this.ctx && this.musicGain) {
      const t = this.ctx.currentTime;
      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.12, t);
      droneGain.connect(this.musicGain);

      [130.81, 196.00].forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.connect(droneGain);
        osc.start(t);
      });
    }

    let noteIdx = 0;
    const melodyPattern = [
      0, 1, 2, 3, 2, 1, 0,
      3, 4, 5, 4, 3, 2, 3,
      5, 4, 3, 2, 1, 0,
      0, 2, 3, 4, 3, 2, 0,
      1, 2, 4, 3, 2, 0, 1
    ];

    const playNextNote = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

      const noteFreq = scale[melodyPattern[noteIdx % melodyPattern.length]];
      noteIdx++;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, t);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(5.4, t);
      lfoGain.gain.setValueAtTime(3.8, t);
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start(t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1900, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.24, t + 0.16);
      gain.gain.setValueAtTime(0.22, t + 0.65);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.05);

      osc.connect(filter).connect(gain).connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 1.1);
      lfo.stop(t + 1.1);

      const delay = 480 + (Math.random() > 0.55 ? 240 : 0);
      this.musicTimer = window.setTimeout(playNextNote, delay);
    };

    playNextNote();
  }

  public stopBackgroundMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audioManager = new AudioManager();
