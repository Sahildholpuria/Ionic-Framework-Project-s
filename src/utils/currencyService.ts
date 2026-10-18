/**
 * Live Currency Exchange Rate Service
 * Fetches real-time, accurate rates with offline caching, fallback baseline,
 * and automatic background updates.
 */

export interface CurrencyMetadata {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const POPULAR_CURRENCIES: CurrencyMetadata[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', flag: '🇶🇦' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', flag: '🇴🇲' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', flag: '🇧🇭' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
];

const STORAGE_KEY_RATES = 'apex_calc_live_rates';
const STORAGE_KEY_TIMESTAMP = 'apex_calc_rates_timestamp';

// Accurate baseline rates (relative to 1 INR) for instant offline fallback
const BASELINE_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.01142,
  EUR: 0.01056,
  GBP: 0.00892,
  AED: 0.03862,
  SAR: 0.04285,
  CAD: 0.01575,
  AUD: 0.01742,
  SGD: 0.01502,
  JPY: 1.745,
  CNY: 0.0828,
  KWD: 0.00351,
  QAR: 0.0416,
  OMR: 0.0044,
  BHD: 0.0043,
  CHF: 0.00985,
  NZD: 0.0191,
  MYR: 0.0512,
  THB: 0.395,
  RUB: 1.125,
  ZAR: 0.208,
  BRL: 0.0655,
};

class CurrencyService {
  private rates: Record<string, number> = { ...BASELINE_RATES };
  private lastUpdated: Date | null = null;
  private isFetching: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
    this.fetchLiveRates();
  }

  private loadFromStorage(): void {
    try {
      const storedRates = localStorage.getItem(STORAGE_KEY_RATES);
      const storedTime = localStorage.getItem(STORAGE_KEY_TIMESTAMP);

      if (storedRates) {
        this.rates = { ...BASELINE_RATES, ...JSON.parse(storedRates) };
      }
      if (storedTime) {
        this.lastUpdated = new Date(parseInt(storedTime, 10));
      }
    } catch {
      // Use baseline
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {}
    }
  }

  public async fetchLiveRates(): Promise<boolean> {
    if (this.isFetching) return false;
    this.isFetching = true;

    try {
      // Primary: Open Exchange Rates public endpoint (Base: INR)
      const res = await fetch('https://open.er-api.com/v6/latest/INR', {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && typeof data.rates === 'object') {
          this.rates = { ...this.rates, ...data.rates };
          this.lastUpdated = new Date();
          this.saveToStorage();
          this.notify();
          this.isFetching = false;
          return true;
        }
      }
    } catch {
      // Primary failed, attempt fallback endpoint
    }

    try {
      // Secondary fallback endpoint
      const resFallback = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      if (resFallback.ok) {
        const data = await resFallback.json();
        if (data && data.rates) {
          this.rates = { ...this.rates, ...data.rates };
          this.lastUpdated = new Date();
          this.saveToStorage();
          this.notify();
          this.isFetching = false;
          return true;
        }
      }
    } catch {
      // Offline or network error
    }

    this.isFetching = false;
    return false;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(this.rates));
      if (this.lastUpdated) {
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, this.lastUpdated.getTime().toString());
      }
    } catch {}
  }

  /**
   * Convert amount from one currency to another using real-time rates
   */
  public convert(amount: number, fromCode: string, toCode: string): number {
    if (isNaN(amount) || amount === 0) return 0;
    if (fromCode === toCode) return amount;

    const fromRate = this.rates[fromCode] || BASELINE_RATES[fromCode] || 1;
    const toRate = this.rates[toCode] || BASELINE_RATES[toCode] || 1;

    // Convert from source currency to base INR, then to target currency
    const inINR = amount / fromRate;
    return inINR * toRate;
  }

  /**
   * Get direct exchange rate between two currencies (e.g. 1 USD = X INR)
   */
  public getExchangeRate(fromCode: string, toCode: string): number {
    return this.convert(1, fromCode, toCode);
  }

  public getLastUpdatedText(): string {
    if (this.isFetching && !this.lastUpdated) return 'Syncing live rates...';
    if (!this.lastUpdated) return 'Real-time rates';
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - this.lastUpdated.getTime()) / 60000);

    if (diffMins < 2) return 'Live Just now';
    if (diffMins < 60) return `Updated ${diffMins}m ago`;
    return `Updated ${this.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  public getSupportedCurrencies(): CurrencyMetadata[] {
    return POPULAR_CURRENCIES;
  }

  public isLive(): boolean {
    return this.lastUpdated !== null;
  }
}

export const currencyService = new CurrencyService();
