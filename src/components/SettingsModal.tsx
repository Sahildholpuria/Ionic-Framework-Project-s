import React from 'react';
import {
  IonModal,
  IonIcon,
  IonToggle,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import {
  closeOutline,
  colorPaletteOutline,
  volumeHighOutline,
  phonePortraitOutline,
  compassOutline,
  informationCircleOutline,
  moonOutline,
  sunnyOutline,
  cashOutline,
  personOutline,
} from 'ionicons/icons';
import { ThemeManager, AppTheme } from '../utils/themeManager';
import { feedback, FeedbackSettings } from '../utils/hapticsAndSound';
import { AngleMode } from '../utils/calculatorEngine';
import { SUPPORTED_CURRENCIES } from './TipSplitView';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  angleMode: AngleMode;
  onAngleModeChange: (mode: AngleMode) => void;
}

const CURRENCY_STORAGE_KEY = 'apex_calc_currency';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  angleMode,
  onAngleModeChange,
}) => {
  const [currentTheme, setCurrentTheme] = React.useState<AppTheme>(ThemeManager.getTheme());
  const [feedbackConfig, setFeedbackConfig] = React.useState<FeedbackSettings>(feedback.getSettings());
  const [selectedCurrency, setSelectedCurrency] = React.useState<string>(() => {
    try {
      return localStorage.getItem(CURRENCY_STORAGE_KEY) || 'INR';
    } catch {
      return 'INR';
    }
  });

  const handleThemeChange = (theme: AppTheme) => {
    feedback.onKeyFeedback('digit');
    ThemeManager.setTheme(theme);
    setCurrentTheme(theme);
  };

  const handleHapticToggle = (enabled: boolean) => {
    feedback.triggerHaptic('medium');
    const updated = feedback.saveSettings({ hapticsEnabled: enabled });
    setFeedbackConfig(updated);
  };

  const handleSoundToggle = (enabled: boolean) => {
    feedback.onKeyFeedback('operator');
    const updated = feedback.saveSettings({ soundEnabled: enabled });
    setFeedbackConfig(updated);
  };

  const handleCurrencyChange = (code: string) => {
    feedback.onKeyFeedback('operator');
    setSelectedCurrency(code);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    } catch {}
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.75} breakpoints={[0, 0.75, 0.95]}>
      <div className="history-sheet">
        <div className="history-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IonIcon icon={colorPaletteOutline} style={{ fontSize: 20, color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: 17, fontWeight: 700 }}>Calculator Preferences</span>
          </div>
          <button className="action-circle-btn" onClick={onClose} title="Close">
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Default Currency Section */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Default Currency (Multi-Currency)
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IonIcon icon={cashOutline} style={{ color: 'var(--accent-cyan)', fontSize: 20 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Primary Currency</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Default: Indian Rupee (INR - ₹)</div>
                </div>
              </div>
              <div className="unit-select-btn">
                <IonSelect
                  value={selectedCurrency}
                  interface="popover"
                  onIonChange={(e) => handleCurrencyChange(e.detail.value)}
                >
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <IonSelectOption key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol}) — {curr.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Theme & Appearance
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                className={`segment-btn ${currentTheme === 'dark' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '10px 0', border: '1px solid var(--border-subtle)' }}
                onClick={() => handleThemeChange('dark')}
              >
                <IonIcon icon={moonOutline} />
                <span>OLED Dark</span>
              </button>
              <button
                className={`segment-btn ${currentTheme === 'light' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '10px 0', border: '1px solid var(--border-subtle)' }}
                onClick={() => handleThemeChange('light')}
              >
                <IonIcon icon={sunnyOutline} />
                <span>Light</span>
              </button>
              <button
                className={`segment-btn ${currentTheme === 'system' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '10px 0', border: '1px solid var(--border-subtle)' }}
                onClick={() => handleThemeChange('system')}
              >
                <IonIcon icon={colorPaletteOutline} />
                <span>Auto</span>
              </button>
            </div>
          </div>

          {/* Feedback & Interaction */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Tactile & Audio Feedback
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IonIcon icon={phonePortraitOutline} style={{ color: 'var(--accent-cyan)', fontSize: 18 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Haptic Vibration</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tactile feedback on Android taps</div>
                  </div>
                </div>
                <IonToggle
                  checked={feedbackConfig.hapticsEnabled}
                  onIonChange={(e) => handleHapticToggle(e.detail.checked)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IonIcon icon={volumeHighOutline} style={{ color: 'var(--accent-amber)', fontSize: 18 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Key Click Audio</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Low-latency synthesized click sound</div>
                  </div>
                </div>
                <IonToggle
                  checked={feedbackConfig.soundEnabled}
                  onIonChange={(e) => handleSoundToggle(e.detail.checked)}
                />
              </div>
            </div>
          </div>

          {/* Angle Mode */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Trigonometry Angle Mode
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {(['DEG', 'RAD', 'GRAD'] as AngleMode[]).map((mode) => (
                <button
                  key={mode}
                  className={`segment-btn ${angleMode === mode ? 'active' : ''}`}
                  style={{ justifyContent: 'center', padding: '10px 0', border: '1px solid var(--border-subtle)' }}
                  onClick={() => {
                    feedback.onKeyFeedback('operator');
                    onAngleModeChange(mode);
                  }}
                >
                  <IonIcon icon={compassOutline} />
                  <span>{mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <img
                src="/logo.png"
                alt="Calculator Logo"
                style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid var(--border-subtle)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Calculator</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--accent-cyan)',
                    background: 'rgba(0, 217, 245, 0.1)',
                    padding: '2px 8px',
                    borderRadius: 12,
                    border: '1px solid rgba(0, 217, 245, 0.25)',
                  }}>
                    v1.0.4
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <IonIcon icon={personOutline} style={{ color: 'var(--accent-cyan)', fontSize: 13 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Developer: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Sahil Dholpuria</span>
                  </span>
                </div>
              </div>
            </div>
            <div style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              paddingTop: 8,
              borderTop: '1px solid var(--border-subtle)',
            }}>
              Engineered with Ionic 9 & Capacitor 8. High-precision math, multi-currency support (Default: Indian Rupee ₹), unit conversions, and Android native haptics.
            </div>
          </div>
        </div>
      </div>
    </IonModal>
  );
};
