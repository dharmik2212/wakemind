import { SoundType, SoundSettings } from '../types';

let audioContext: AudioContext | null = null;
let activeSourceNodes: AudioNode[] = [];
let activeInterval: any = null;
let customAudioElement: HTMLAudioElement | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
};

const stopOscillators = () => {
  activeSourceNodes.forEach(node => {
    try {
      (node as any).stop();
      node.disconnect();
    } catch (e) { /* ignore */ }
  });
  activeSourceNodes = [];
  
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
  }
};

const stopCustomAudio = () => {
  if (customAudioElement) {
    customAudioElement.pause();
    customAudioElement.currentTime = 0;
    customAudioElement = null;
  }
};

export const stopAlarmSound = () => {
  stopOscillators();
  stopCustomAudio();
};

export const playAlarmSound = (settings: SoundSettings = { type: SoundType.CLASSIC }) => {
  stopAlarmSound(); // Ensure clean slate

  if (settings.type === SoundType.CUSTOM && settings.customData) {
    playCustomSound(settings.customData);
  } else {
    // Web Audio presets
    initAudioContext();
    if (!audioContext) return;

    switch (settings.type) {
      case SoundType.GENTLE:
        playGentleAlarm(audioContext);
        break;
      case SoundType.SIREN:
        playSirenAlarm(audioContext);
        break;
      case SoundType.CLASSIC:
      default:
        playClassicAlarm(audioContext);
        break;
    }
  }
};

const playCustomSound = (dataUri: string) => {
  customAudioElement = new Audio(dataUri);
  customAudioElement.loop = true;
  customAudioElement.play().catch(e => console.error("Failed to play custom sound", e));
};

// --- Presets ---

const playClassicAlarm = (ctx: AudioContext) => {
  // Classic digital beep pattern
  const playBeep = () => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    
    // Track for cleanup although these are short lived
  };

  playBeep();
  // Double beep every second
  setTimeout(() => { if(activeInterval) playBeep() }, 150);

  activeInterval = setInterval(() => {
    playBeep();
    setTimeout(() => { if(activeInterval) playBeep() }, 150);
  }, 1000);
};

const playGentleAlarm = (ctx: AudioContext) => {
  // Sine waves, chimes
  const playChime = () => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    // Randomize slightly for a windchime effect
    const freq = 440 + Math.random() * 220; 
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2);
  };

  playChime();
  activeInterval = setInterval(() => {
    playChime();
    // Add a second note slightly offset
    setTimeout(() => { if(activeInterval) playChime() }, 500);
  }, 2000);
};

const playSirenAlarm = (ctx: AudioContext) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  
  // LFO for frequency modulation
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 2; // 2Hz siren
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 200; // Modulate by +/- 200Hz
  
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  
  gain.gain.value = 0.3;
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  lfo.start();
  
  activeSourceNodes.push(osc);
  activeSourceNodes.push(lfo);
};
