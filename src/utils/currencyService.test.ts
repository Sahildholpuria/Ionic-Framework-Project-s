import { describe, it, expect } from 'vitest';
import { currencyService } from './currencyService';

describe('CurrencyService', () => {
  it('converts correctly with baseline rates', () => {
    // 100 INR to INR is 100
    expect(currencyService.convert(100, 'INR', 'INR')).toBe(100);

    // 0 amount is 0
    expect(currencyService.convert(0, 'USD', 'INR')).toBe(0);

    // Converting USD to INR should yield a positive realistic value (> 70)
    const usdToInr = currencyService.convert(1, 'USD', 'INR');
    expect(usdToInr).toBeGreaterThan(70);
    expect(usdToInr).toBeLessThan(120);

    // Converting EUR to INR should be higher than USD to INR
    const eurToInr = currencyService.convert(1, 'EUR', 'INR');
    expect(eurToInr).toBeGreaterThan(usdToInr);
  });

  it('handles reciprocal exchange rates with mathematical precision', () => {
    const rate1 = currencyService.getExchangeRate('USD', 'INR');
    const rate2 = currencyService.getExchangeRate('INR', 'USD');
    expect(rate1 * rate2).toBeCloseTo(1, 4);
  });

  it('supports major world currencies including Indian Rupee', () => {
    const currencies = currencyService.getSupportedCurrencies();
    const codes = currencies.map((c) => c.code);
    expect(codes).toContain('INR');
    expect(codes).toContain('USD');
    expect(codes).toContain('EUR');
    expect(codes).toContain('GBP');
    expect(codes).toContain('AED');
    expect(codes).toContain('SAR');
  });
});
