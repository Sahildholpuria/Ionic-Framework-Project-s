import React, { useState, useEffect } from 'react';
import { IonIcon, IonSelect, IonSelectOption, IonToast } from '@ionic/react';
import {
  swapVerticalOutline,
  backspaceOutline,
  cashOutline,
  refreshOutline,
  resizeOutline,
  barbellOutline,
  thermometerOutline,
  gridOutline,
  waterOutline,
  speedometerOutline,
  serverOutline,
  timeOutline,
} from 'ionicons/icons';
import {
  UNIT_CATEGORIES,
  UnitCategory,
  convertUnits,
} from '../utils/unitConverter';
import { currencyService, POPULAR_CURRENCIES } from '../utils/currencyService';
import { feedback } from '../utils/hapticsAndSound';

const ICONS_MAP: Record<string, any> = {
  'cash-outline': cashOutline,
  'resize-outline': resizeOutline,
  'barbell-outline': barbellOutline,
  'thermometer-outline': thermometerOutline,
  'grid-outline': gridOutline,
  'water-outline': waterOutline,
  'speedometer-outline': speedometerOutline,
  'server-outline': serverOutline,
  'time-outline': timeOutline,
};

export const UnitConverterView: React.FC = () => {
  // Default category is Currency with Indian Rupee (INR)
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory>('currency');
  const [inputValue, setInputValue] = useState<string>('0');
  const [fromUnit, setFromUnit] = useState<string>('INR');
  const [toUnit, setToUnit] = useState<string>('USD');
  const [rateText, setRateText] = useState<string>(currencyService.getLastUpdatedText());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Subscribe to live currency updates
  useEffect(() => {
    const unsubscribe = currencyService.subscribe(() => {
      setRateText(currencyService.getLastUpdatedText());
    });
    return unsubscribe;
  }, []);

  const handleRefreshRates = async () => {
    feedback.onKeyFeedback('operator');
    setIsRefreshing(true);
    const success = await currencyService.fetchLiveRates();
    setIsRefreshing(false);
    if (success) {
      setRateText(currencyService.getLastUpdatedText());
      setToastMsg('Live exchange rates updated successfully');
    } else {
      setToastMsg('Using cached exchange rates');
    }
  };

  const handleCategorySelect = (catId: UnitCategory) => {
    feedback.onKeyFeedback('operator');
    setSelectedCategory(catId);
    if (catId === 'currency') {
      setFromUnit('INR');
      setToUnit('USD');
    } else {
      const catData = UNIT_CATEGORIES.find((c) => c.id === catId);
      if (catData && catData.units.length >= 2) {
        setFromUnit(catData.units[0].id);
        setToUnit(catData.units[1].id);
      }
    }
  };

  const currentCatData = UNIT_CATEGORIES.find((c) => c.id === selectedCategory) || UNIT_CATEGORIES[0];

  const handleSwap = () => {
    feedback.onKeyFeedback('operator');
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleKeyPress = (key: string) => {
    feedback.onKeyFeedback(key === 'clear' || key === 'back' ? 'delete' : 'digit');

    if (key === 'clear') {
      setInputValue('0');
      return;
    }
    if (key === 'back') {
      setInputValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (key === '.') {
      if (!inputValue.includes('.')) {
        setInputValue((prev) => prev + '.');
      }
      return;
    }

    setInputValue((prev) => {
      if (prev === '0') return key;
      if (prev.length >= 12) return prev;
      return prev + key;
    });
  };

  const numericInput = parseFloat(inputValue) || 0;

  // Calculate conversion: use live currency service for currency, unit converter for others
  let converted = 0;
  if (selectedCategory === 'currency') {
    converted = currencyService.convert(numericInput, fromUnit, toUnit);
  } else {
    converted = convertUnits(numericInput, selectedCategory, fromUnit, toUnit);
  }

  const formatConverted = (val: number): string => {
    if (isNaN(val)) return '0';
    if (!isFinite(val)) return 'Infinity';
    const rounded = Number(val.toPrecision(8));

    if (selectedCategory === 'currency') {
      if (toUnit === 'INR') {
        return rounded.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
      return rounded.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });
    }

    if (Math.abs(rounded) >= 1e9 || (Math.abs(rounded) < 1e-5 && rounded !== 0)) {
      return rounded.toExponential(4);
    }
    return rounded.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  const fromCurrObj = POPULAR_CURRENCIES.find((c) => c.code === fromUnit);
  const toCurrObj = POPULAR_CURRENCIES.find((c) => c.code === toUnit);

  const fromUnitObj = currentCatData.units.find((u) => u.id === fromUnit);
  const toUnitObj = currentCatData.units.find((u) => u.id === toUnit);

  // Live direct rate: 1 fromUnit = X toUnit
  const singleRate = selectedCategory === 'currency' ? currencyService.getExchangeRate(fromUnit, toUnit) : null;

  return (
    <div className="converter-container">
      {/* Category Scroll Chips */}
      <div className="category-scroll">
        {UNIT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`cat-chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategorySelect(cat.id)}
          >
            <IonIcon icon={ICONS_MAP[cat.icon] || resizeOutline} />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Live Exchange Rate Status Bar (only for Currency mode) */}
      {selectedCategory === 'currency' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: '6px 12px',
          fontSize: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <span style={{ color: '#10b981', fontSize: 10 }}>●</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              1 {fromUnit} = {singleRate ? (singleRate < 1 ? singleRate.toFixed(4) : singleRate.toFixed(2)) : ''} {toUnit}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>• {rateText}</span>
          </div>

          <button
            onClick={handleRefreshRates}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
            }}
            title="Refresh Live Rates"
          >
            <IonIcon
              icon={refreshOutline}
              style={{
                fontSize: 16,
                animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
              }}
            />
          </button>
        </div>
      )}

      {/* Two-Way Conversion Cards */}
      <div className="conversion-cards">
        {/* Source Card */}
        <div className="conversion-card">
          <div className="card-label">
            <span>FROM</span>
            <div className="unit-select-btn">
              {selectedCategory === 'currency' ? (
                <IonSelect
                  value={fromUnit}
                  interface="popover"
                  onIonChange={(e) => {
                    feedback.onKeyFeedback('operator');
                    setFromUnit(e.detail.value);
                  }}
                >
                  {POPULAR_CURRENCIES.map((c) => (
                    <IonSelectOption key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.symbol}) — {c.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              ) : (
                <IonSelect
                  value={fromUnit}
                  interface="popover"
                  onIonChange={(e) => {
                    feedback.onKeyFeedback('operator');
                    setFromUnit(e.detail.value);
                  }}
                >
                  {currentCatData.units.map((u) => (
                    <IonSelectOption key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </IonSelectOption>
                  ))}
                </IonSelect>
              )}
            </div>
          </div>
          <div className="card-value">
            {inputValue}{' '}
            <span style={{ fontSize: 18, color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {selectedCategory === 'currency' ? fromCurrObj?.symbol : fromUnitObj?.symbol}
            </span>
          </div>
        </div>

        {/* Swap Button */}
        <div className="swap-btn-wrap">
          <button className="swap-btn" onClick={handleSwap} title="Swap">
            <IonIcon icon={swapVerticalOutline} style={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Target Card */}
        <div className="conversion-card" style={{ borderColor: 'var(--border-focus)' }}>
          <div className="card-label">
            <span>TO</span>
            <div className="unit-select-btn">
              {selectedCategory === 'currency' ? (
                <IonSelect
                  value={toUnit}
                  interface="popover"
                  onIonChange={(e) => {
                    feedback.onKeyFeedback('operator');
                    setToUnit(e.detail.value);
                  }}
                >
                  {POPULAR_CURRENCIES.map((c) => (
                    <IonSelectOption key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.symbol}) — {c.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              ) : (
                <IonSelect
                  value={toUnit}
                  interface="popover"
                  onIonChange={(e) => {
                    feedback.onKeyFeedback('operator');
                    setToUnit(e.detail.value);
                  }}
                >
                  {currentCatData.units.map((u) => (
                    <IonSelectOption key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </IonSelectOption>
                  ))}
                </IonSelect>
              )}
            </div>
          </div>
          <div className="card-value" style={{ color: 'var(--accent-cyan)' }}>
            {formatConverted(converted)}{' '}
            <span style={{ fontSize: 18, color: 'var(--text-secondary)', fontWeight: 600 }}>
              {selectedCategory === 'currency' ? toCurrObj?.symbol : toUnitObj?.symbol}
            </span>
          </div>
        </div>
      </div>

      {/* Numeric Keypad for fast conversion entry */}
      <div style={{ marginTop: 'auto', paddingTop: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {['7', '8', '9', '4', '5', '6', '1', '2', '3', 'clear', '0', '.'].map((key) => {
            if (key === 'clear') {
              return (
                <button
                  key={key}
                  className="key-btn key-action clear-btn"
                  style={{ height: 46, fontSize: 17 }}
                  onClick={() => handleKeyPress('clear')}
                >
                  AC
                </button>
              );
            }
            return (
              <button
                key={key}
                className="key-btn key-number"
                style={{ height: 46, fontSize: 20 }}
                onClick={() => handleKeyPress(key)}
              >
                {key}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 6 }}>
          <button
            className="key-btn key-action"
            style={{ width: '100%', height: 42, fontSize: 18 }}
            onClick={() => handleKeyPress('back')}
          >
            <IonIcon icon={backspaceOutline} style={{ fontSize: 20 }} />
          </button>
        </div>
      </div>

      <IonToast
        isOpen={!!toastMsg}
        message={toastMsg || ''}
        duration={1500}
        onDidDismiss={() => setToastMsg(null)}
        position="bottom"
      />
    </div>
  );
};
