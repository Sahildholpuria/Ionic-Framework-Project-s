/**
 * Advanced & Basic Calculator Engine
 * Handles expression parsing, scientific functions, trigonometry (DEG/RAD/GRAD),
 * percentages, memory registers, live evaluation preview, and formatting.
 */

export type AngleMode = 'DEG' | 'RAD' | 'GRAD';

export interface EvaluationResult {
  success: boolean;
  result: string;
  error?: string;
  isInteger?: boolean;
}

export interface MemoryState {
  value: number;
  hasValue: boolean;
}

// Factorial helper with gamma approximation for floating point or standard integer
export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (Number.isInteger(n) && n <= 170) {
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
  // Lanczos approximation for gamma(n + 1)
  const g = 7;
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109585720572,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];
  const z = n;
  let x = p[0];
  for (let i = 1; i < g + 2; i++) {
    x += p[i] / (z + i);
  }
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

export class CalculatorEngine {
  private angleMode: AngleMode = 'DEG';
  private memory: number = 0;
  private hasMemory: boolean = false;

  constructor(angleMode: AngleMode = 'DEG') {
    this.angleMode = angleMode;
  }

  public setAngleMode(mode: AngleMode) {
    this.angleMode = mode;
  }

  public getAngleMode(): AngleMode {
    return this.angleMode;
  }

  // Memory operations
  public memoryClear(): void {
    this.memory = 0;
    this.hasMemory = false;
  }

  public memoryRecall(): number {
    return this.hasMemory ? this.memory : 0;
  }

  public memoryAdd(val: number): void {
    this.memory += val;
    this.hasMemory = true;
  }

  public memorySubtract(val: number): void {
    this.memory -= val;
    this.hasMemory = true;
  }

  public memoryStore(val: number): void {
    this.memory = val;
    this.hasMemory = true;
  }

  public getMemoryState(): MemoryState {
    return {
      value: this.memory,
      hasValue: this.hasMemory,
    };
  }

  /**
   * Converts angle to radians based on the current mode
   */
  private toRadians(angle: number): number {
    if (this.angleMode === 'DEG') {
      return (angle * Math.PI) / 180;
    } else if (this.angleMode === 'GRAD') {
      return (angle * Math.PI) / 200;
    }
    return angle; // RAD
  }

  /**
   * Converts radians to target angle mode (for inverse trig)
   */
  private fromRadians(rad: number): number {
    if (this.angleMode === 'DEG') {
      return (rad * 180) / Math.PI;
    } else if (this.angleMode === 'GRAD') {
      return (rad * 200) / Math.PI;
    }
    return rad;
  }

  /**
   * Format display result with high precision and clean representation
   */
  public formatNumber(val: number): string {
    if (isNaN(val)) return 'Error';
    if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';

    // Handle floating point imprecisions e.g. 0.1 + 0.2 = 0.30000000000000004
    const rounded = Number(val.toPrecision(12));

    // For extremely large or small numbers, use scientific notation
    const absVal = Math.abs(rounded);
    if ((absVal >= 1e12 || (absVal < 1e-7 && absVal > 0))) {
      return rounded.toExponential(6).replace(/\.?0+e/, 'e');
    }

    // Format with commas for integers
    const parts = rounded.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  /**
   * Tokenizes and sanitizes user input for evaluation
   */
  private prepareExpression(rawExpr: string): string {
    let expr = rawExpr;

    // Replace visual symbols with javascript math operations
    expr = expr.replace(/×/g, '*');
    expr = expr.replace(/÷/g, '/');
    expr = expr.replace(/−/g, '-');
    expr = expr.replace(/π/g, `${Math.PI}`);
    expr = expr.replace(/\be\b/g, `${Math.E}`);
    expr = expr.replace(/φ/g, `1.618033988749895`);

    // Handle implicit multiplication: e.g., "5(2)" -> "5*(2)", ")(" -> ")*("
    expr = expr.replace(/(\d)(\()/g, '$1*(');
    expr = expr.replace(/(\))(\d)/g, '$1*$2');
    expr = expr.replace(/(\))(\()/g, '$1*(');

    // Percentage handling: e.g. 200 + 10% -> 200 + (200 * 0.10)
    // or standalone 50% -> (50/100)
    expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    return expr;
  }

  /**
   * Evaluate a mathematical expression string safely
   */
  public evaluate(rawExpr: string): EvaluationResult {
    if (!rawExpr || rawExpr.trim() === '') {
      return { success: true, result: '0' };
    }

    try {
      // Balance unclosed parentheses automatically
      let expr = rawExpr.trim();
      let openParenCount = 0;
      for (const char of expr) {
        if (char === '(') openParenCount++;
        if (char === ')') openParenCount--;
      }
      while (openParenCount > 0) {
        expr += ')';
        openParenCount--;
      }

      const prepared = this.prepareExpression(expr);
      const val = this.parseAndCompute(prepared);

      if (isNaN(val)) {
        return { success: false, result: 'Error', error: 'Invalid calculation' };
      }
      if (!isFinite(val)) {
        return { success: false, result: 'Cannot divide by zero', error: 'Zero division' };
      }

      return {
        success: true,
        result: this.formatNumber(val),
        isInteger: Number.isInteger(val),
      };
    } catch (e: any) {
      return {
        success: false,
        result: 'Error',
        error: e?.message || 'Syntax Error',
      };
    }
  }

  /**
   * Live preview evaluation: returns quick result or null if incomplete
   */
  public preview(rawExpr: string): string | null {
    if (!rawExpr || rawExpr.trim().length === 0) return null;
    
    // If ends with an operator, preview the evaluation up to that operator or return null
    const trimmed = rawExpr.trim();
    const lastChar = trimmed.slice(-1);
    if (['+', '-', '×', '÷', '*', '/', '^', '('].includes(lastChar)) {
      return null;
    }

    const evalRes = this.evaluate(rawExpr);
    if (evalRes.success && evalRes.result !== 'Error' && evalRes.result !== rawExpr) {
      return evalRes.result;
    }
    return null;
  }

  /**
   * Parser & evaluator that supports functions, operators, and constants
   */
  private parseAndCompute(expr: string): number {
    // Custom safe recursive math evaluator
    // We map custom functions into Math equivalents with angle conversions
    const ctx = {
      sin: (x: number) => {
        const rad = this.toRadians(x);
        // Clean rounding for known zero points e.g. sin(180) = 0
        const res = Math.sin(rad);
        return Math.abs(res) < 1e-15 ? 0 : res;
      },
      cos: (x: number) => {
        const rad = this.toRadians(x);
        const res = Math.cos(rad);
        return Math.abs(res) < 1e-15 ? 0 : res;
      },
      tan: (x: number) => {
        const rad = this.toRadians(x);
        const cosVal = Math.cos(rad);
        if (Math.abs(cosVal) < 1e-15) throw new Error('Undefined (tan asymptote)');
        const res = Math.tan(rad);
        return Math.abs(res) < 1e-15 ? 0 : res;
      },
      asin: (x: number) => {
        if (x < -1 || x > 1) throw new Error('Domain error for asin');
        return this.fromRadians(Math.asin(x));
      },
      acos: (x: number) => {
        if (x < -1 || x > 1) throw new Error('Domain error for acos');
        return this.fromRadians(Math.acos(x));
      },
      atan: (x: number) => this.fromRadians(Math.atan(x)),
      sinh: (x: number) => Math.sinh(x),
      cosh: (x: number) => Math.cosh(x),
      tanh: (x: number) => Math.tanh(x),
      asinh: (x: number) => Math.asinh(x),
      acosh: (x: number) => {
        if (x < 1) throw new Error('Domain error for acosh');
        return Math.acosh(x);
      },
      atanh: (x: number) => {
        if (x <= -1 || x >= 1) throw new Error('Domain error for atanh');
        return Math.atanh(x);
      },
      sqrt: (x: number) => {
        if (x < 0) throw new Error('Negative square root');
        return Math.sqrt(x);
      },
      cbrt: (x: number) => Math.cbrt(x),
      ln: (x: number) => {
        if (x <= 0) throw new Error('Log of non-positive');
        return Math.log(x);
      },
      log: (x: number) => {
        if (x <= 0) throw new Error('Log of non-positive');
        return Math.log10(x);
      },
      log2: (x: number) => {
        if (x <= 0) throw new Error('Log of non-positive');
        return Math.log2(x);
      },
      exp: (x: number) => Math.exp(x),
      fact: (x: number) => factorial(x),
      abs: (x: number) => Math.abs(x),
      pow: (base: number, exp: number) => Math.pow(base, exp),
      rand: () => Math.random(),
    };

    // Replace function expressions:
    // e.g. sin(30) -> ctx.sin(30)
    let processed = expr;

    // Handle powers: a^b -> ctx.pow(a, b)
    // Replace '^' with operator exponentiation or pow
    processed = this.transformPowers(processed);

    // Factorials: n! -> ctx.fact(n)
    processed = processed.replace(/(\d+(\.\d+)?|\([^\)]+\))!/g, 'ctx.fact($1)');

    // Replace scientific function names with ctx calls
    const funcs = ['asin', 'acos', 'atan', 'asinh', 'acosh', 'atanh', 'sinh', 'cosh', 'tanh', 'sin', 'cos', 'tan', 'sqrt', 'cbrt', 'ln', 'log2', 'log', 'exp', 'abs', 'rand'];
    for (const f of funcs) {
      const regex = new RegExp(`\\b${f}\\(`, 'g');
      processed = processed.replace(regex, `ctx.${f}(`);
    }

    // Sanitize to only permit allowed tokens for safe execution
    const allowed = /^[0-9+\-*/()., eE\s]|ctx\.(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|asinh|acosh|atanh|sqrt|cbrt|ln|log|log2|exp|fact|abs|pow|rand)\(/;
    // Disallow dangerous keywords like window, global, import, eval, etc.
    if (/[a-zA-Z_$]/.test(processed.replace(/ctx\.(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|asinh|acosh|atanh|sqrt|cbrt|ln|log|log2|exp|fact|abs|pow|rand)/g, ''))) {
      throw new Error('Unsupported tokens in expression');
    }

    // Execute with context scope
    const fn = new Function('ctx', `"use strict"; return (${processed});`);
    return fn(ctx);
  }

  private transformPowers(expr: string): string {
    let result = expr;
    // Replace x^y from inner outward
    while (result.includes('^')) {
      const caretIdx = result.lastIndexOf('^');
      
      // Find left operand (number or bracketed group)
      let leftStart = caretIdx - 1;
      while (leftStart >= 0 && result[leftStart] === ' ') leftStart--;

      let leftOperand = '';
      if (result[leftStart] === ')') {
        let depth = 1;
        leftStart--;
        while (leftStart >= 0 && depth > 0) {
          if (result[leftStart] === ')') depth++;
          if (result[leftStart] === '(') depth--;
          leftStart--;
        }
        leftOperand = result.slice(leftStart + 1, caretIdx).trim();
      } else {
        while (leftStart >= 0 && /[0-9.a-zA-Z_)]/.test(result[leftStart])) {
          leftStart--;
        }
        leftOperand = result.slice(leftStart + 1, caretIdx).trim();
      }

      // Find right operand
      let rightEnd = caretIdx + 1;
      while (rightEnd < result.length && result[rightEnd] === ' ') rightEnd++;

      let rightOperand = '';
      if (result[rightEnd] === '(') {
        let depth = 1;
        rightEnd++;
        while (rightEnd < result.length && depth > 0) {
          if (result[rightEnd] === '(') depth++;
          if (result[rightEnd] === ')') depth--;
          rightEnd++;
        }
        rightOperand = result.slice(caretIdx + 1, rightEnd).trim();
      } else {
        while (rightEnd < result.length && /[0-9.a-zA-Z_]/.test(result[rightEnd])) {
          rightEnd++;
        }
        rightOperand = result.slice(caretIdx + 1, rightEnd).trim();
      }

      const replacement = `ctx.pow(${leftOperand},${rightOperand})`;
      result = result.slice(0, leftStart + 1) + replacement + result.slice(rightEnd);
    }
    return result;
  }
}
