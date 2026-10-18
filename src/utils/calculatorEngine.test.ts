import { describe, it, expect } from 'vitest';
import { CalculatorEngine, factorial } from './calculatorEngine';

describe('CalculatorEngine', () => {
  const engine = new CalculatorEngine('DEG');

  it('performs basic arithmetic with correct precedence', () => {
    expect(engine.evaluate('2 + 3 * 4').result).toBe('14');
    expect(engine.evaluate('(2 + 3) * 4').result).toBe('20');
    expect(engine.evaluate('100 - 25 * 2').result).toBe('50');
    expect(engine.evaluate('50 / 2 + 5').result).toBe('30');
  });

  it('avoids floating point rounding anomalies', () => {
    expect(engine.evaluate('0.1 + 0.2').result).toBe('0.3');
  });

  it('handles percentage expressions', () => {
    expect(engine.evaluate('200 * 15%').result).toBe('30');
  });

  it('calculates factorials properly', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(5)).toBe(120);
    expect(engine.evaluate('5!').result).toBe('120');
  });

  it('evaluates trigonometric functions in DEG mode', () => {
    expect(engine.evaluate('sin(30)').result).toBe('0.5');
    expect(engine.evaluate('cos(60)').result).toBe('0.5');
    expect(engine.evaluate('tan(45)').result).toBe('1');
    expect(engine.evaluate('asin(0.5)').result).toBe('30');
  });

  it('evaluates trigonometric functions in RAD mode', () => {
    engine.setAngleMode('RAD');
    expect(engine.evaluate('cos(0)').result).toBe('1');
    engine.setAngleMode('DEG'); // reset
  });

  it('handles powers and square roots', () => {
    expect(engine.evaluate('2^8').result).toBe('256');
    expect(engine.evaluate('sqrt(144)').result).toBe('12');
    expect(engine.evaluate('cbrt(27)').result).toBe('3');
  });

  it('handles constants π and e', () => {
    const resPi = parseFloat(engine.evaluate('π').result);
    expect(resPi).toBeCloseTo(3.14159, 4);
  });

  it('handles division by zero safely', () => {
    const res = engine.evaluate('42 / 0');
    expect(res.success).toBe(false);
    expect(res.result).toBe('Cannot divide by zero');
  });

  it('handles memory registers correctly', () => {
    engine.memoryStore(50);
    expect(engine.getMemoryState().hasValue).toBe(true);
    expect(engine.memoryRecall()).toBe(50);
    engine.memoryAdd(25);
    expect(engine.memoryRecall()).toBe(75);
    engine.memorySubtract(10);
    expect(engine.memoryRecall()).toBe(65);
    engine.memoryClear();
    expect(engine.getMemoryState().hasValue).toBe(false);
  });
});
