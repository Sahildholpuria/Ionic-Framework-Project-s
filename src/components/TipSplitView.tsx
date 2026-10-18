import React, { useState, useEffect } from 'react';
import { IonIcon, IonSelect, IonSelectOption } from '@ionic/react';
import {
  peopleOutline,
  removeOutline,
  addOutline,
  backspaceOutline,
  cashOutline,
} from 'ionicons/icons';
import { feedback } from '../utils/hapticsAndSound';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar' },
];

const CURRENCY_STORAGE_KEY = 'apex_calc_currency';

export const TipSplitView: React.FC = () => {
  const [billAmount, setBillAmount] = useState<string>('0');
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(() => {
    try {
      const savedCode = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCode) {
        const found = SUPPORTED_CURRENCIES.find((c) => c.code === savedCode);
        if (found) return found;
      }
    } catch {
      // Fallback
    }
    // Default is Indian Rupee (INR - ₹)
    return SUPPORTED_CURRENCIES[0];
  });

  const handleCurrencyChange = (code: string) => {
    feedback.onKeyFeedback('operator');
    const match = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (match) {
      setSelectedCurrency(match);
      try {
        localStorage.setItem(CURRENCY_STORAGE_KEY, match.code);
      } catch {}
    }
  };

  const bill = parseFloat(billAmount) || 0;
  const tipTotal = (bill * tipPercent) / 100;
  const grandTotal = bill + tipTotal;
  const perPerson = peopleCount > 0 ? grandTotal / peopleCount : 0;
  const tipPerPerson = peopleCount > 0 ? tipTotal / peopleCount : 0;

  // Indian Rupee formatting helper
  const formatAmount = (val: number): string => {
    if (selectedCurrency.code === 'INR') {
      return val.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleKeyPress = (key: string) => {
    feedback.onKeyFeedback(key === 'clear' || key === 'back' ? 'delete' : 'digit');

    if (key === 'clear') {
      setBillAmount('0');
      return;
    }
    if (key === 'back') {
      setBillAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (key === '.') {
      if (!billAmount.includes('.')) {
        setBillAmount((prev) => prev + '.');
      }
      return;
    }

    setBillAmount((prev) => {
      if (prev === '0') return key;
      if (prev.length >= 9) return prev;
      return prev + key;
    });
  };

  const handlePeopleChange = (delta: number) => {
    feedback.onKeyFeedback('operator');
    setPeopleCount((prev) => Math.max(1, Math.min(50, prev + delta)));
  };

  return (
    <div className="tip-container">
      {/* Result Card */}
      <div className="tip-result-card">
        <div className="result-main">
          <div className="label">Each Person Pays</div>
          <div className="amount">
            {selectedCurrency.symbol}{formatAmount(perPerson)}
          </div>
        </div>

        <div className="result-grid">
          <div className="result-item">
            <span className="item-label">Tip Total ({tipPercent}%)</span>
            <span className="item-val">{selectedCurrency.symbol}{formatAmount(tipTotal)}</span>
          </div>
          <div className="result-item">
            <span className="item-label">Tip / Person</span>
            <span className="item-val">{selectedCurrency.symbol}{formatAmount(tipPerPerson)}</span>
          </div>
          <div className="result-item">
            <span className="item-label">Bill Subtotal</span>
            <span className="item-val">{selectedCurrency.symbol}{formatAmount(bill)}</span>
          </div>
          <div className="result-item">
            <span className="item-label">Grand Total</span>
            <span className="item-val" style={{ color: 'var(--accent-cyan)' }}>
              {selectedCurrency.symbol}{formatAmount(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Bill Amount Display with Multi-Currency Selector */}
      <div className="conversion-card">
        <div className="card-label">
          <span>BILL AMOUNT</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="unit-select-btn">
              <IonSelect
                value={selectedCurrency.code}
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
        <div className="card-value">
          <span style={{ color: 'var(--accent-cyan)', marginRight: 4 }}>{selectedCurrency.symbol}</span>
          {billAmount}
        </div>
      </div>

      {/* Tip Percent Chips */}
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700, letterSpacing: 0.5 }}>
          TIP PERCENTAGE
        </div>
        <div className="tip-chips">
          {[0, 5, 10, 15, 20].map((pct) => (
            <button
              key={pct}
              className={`tip-chip ${tipPercent === pct ? 'active' : ''}`}
              onClick={() => {
                feedback.onKeyFeedback('operator');
                setTipPercent(pct);
              }}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Split Among People Stepper */}
      <div className="stepper">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IonIcon icon={peopleOutline} style={{ fontSize: 20, color: 'var(--accent-cyan)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Split Among</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{peopleCount} people</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="stepper-btn" onClick={() => handlePeopleChange(-1)}>
            <IonIcon icon={removeOutline} />
          </button>
          <span style={{ fontFamily: 'var(--mono-font)', fontSize: 17, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
            {peopleCount}
          </span>
          <button className="stepper-btn" onClick={() => handlePeopleChange(1)}>
            <IonIcon icon={addOutline} />
          </button>
        </div>
      </div>

      {/* Keypad for fast bill entry */}
      <div style={{ marginTop: 'auto', paddingTop: 4 }}>
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
    </div>
  );
};
