import { Clipboard } from '@capacitor/clipboard';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  mode: 'basic' | 'scientific' | 'converter';
}

const STORAGE_KEY = 'apex_calc_history';
const MAX_HISTORY_ITEMS = 80;

export class HistoryManager {
  public static getHistory(): HistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static addEntry(expression: string, result: string, mode: 'basic' | 'scientific' | 'converter' = 'basic'): HistoryItem | null {
    if (!expression || !result || result === 'Error') return null;

    try {
      const current = this.getHistory();
      // Avoid duplicate consecutive entries
      if (current.length > 0 && current[0].expression === expression && current[0].result === result) {
        return current[0];
      }

      const newItem: HistoryItem = {
        id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        expression,
        result,
        timestamp: Date.now(),
        mode,
      };

      const updated = [newItem, ...current].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newItem;
    } catch {
      return null;
    }
  }

  public static clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  public static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await Clipboard.write({ string: text });
      return true;
    } catch {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  public static formatTimestamp(ts: number): string {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Today, ${timeStr}`;
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  }
}
