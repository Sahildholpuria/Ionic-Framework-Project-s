import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface FeedbackSettings {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  volume: number; // 0 to 1
}

const SETTINGS_KEY = 'apex_calc_feedback_settings';

class FeedbackService {
  private settings: FeedbackSettings = {
    hapticsEnabled: true,
    soundEnabled: true,
    volume: 0.35,
  };

  private audioCtx: AudioContext | null = null;

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback to defaults
    }
  }

  public saveSettings(newSettings: Partial<FeedbackSettings>): FeedbackSettings {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore localStorage failure
    }
    return this.settings;
  }

  public getSettings(): FeedbackSettings {
    return { ...this.settings };
  }

  /**
   * Initialize or resume Web Audio Context on user gesture
   */
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Synthesize crisp, modern mechanical/soft click sound
   */
  public playClickSound(tone: 'digit' | 'operator' | 'equals' | 'delete' = 'digit'): void {
    if (!this.settings.soundEnabled) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      let freq = 1200;
      let duration = 0.025;
      let targetVol = this.settings.volume * 0.4;

      if (tone === 'operator') {
        freq = 880;
        duration = 0.035;
        targetVol = this.settings.volume * 0.5;
        osc.type = 'triangle';
      } else if (tone === 'equals') {
        freq = 640;
        duration = 0.055;
        targetVol = this.settings.volume * 0.6;
        osc.type = 'sine';
      } else if (tone === 'delete') {
        freq = 420;
        duration = 0.03;
        targetVol = this.settings.volume * 0.4;
        osc.type = 'triangle';
      } else {
        // digit
        osc.type = 'sine';
      }

      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + duration);

      gain.gain.setValueAtTime(targetVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Native Android tactile feedback via Capacitor Haptics
   */
  public async triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' = 'light'): Promise<void> {
    if (!this.settings.hapticsEnabled) return;

    try {
      if (type === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (type === 'medium') {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (type === 'heavy') {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else {
        await Haptics.selectionChanged();
      }
    } catch {
      // Fallback for browsers or devices without native capacitor plugin loaded
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        if (type === 'light') navigator.vibrate(12);
        else if (type === 'medium') navigator.vibrate(25);
        else if (type === 'heavy') navigator.vibrate([35, 20, 35]);
        else navigator.vibrate(8);
      }
    }
  }

  /**
   * Combined feedback on user key press
   */
  public onKeyFeedback(tone: 'digit' | 'operator' | 'equals' | 'delete' = 'digit'): void {
    this.playClickSound(tone);

    if (tone === 'digit') {
      this.triggerHaptic('light');
    } else if (tone === 'operator') {
      this.triggerHaptic('medium');
    } else if (tone === 'equals') {
      this.triggerHaptic('heavy');
    } else if (tone === 'delete') {
      this.triggerHaptic('medium');
    }
  }
}

export const feedback = new FeedbackService();
