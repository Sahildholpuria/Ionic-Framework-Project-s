import { StatusBar, Style } from '@capacitor/status-bar';

export type AppTheme = 'dark' | 'light' | 'system';

const THEME_KEY = 'apex_calc_theme';

export class ThemeManager {
  private static currentTheme: AppTheme = 'dark';

  public static init(): AppTheme {
    const saved = (localStorage.getItem(THEME_KEY) as AppTheme) || 'dark';
    this.setTheme(saved);
    return saved;
  }

  public static getTheme(): AppTheme {
    return this.currentTheme;
  }

  public static setTheme(theme: AppTheme): void {
    this.currentTheme = theme;
    localStorage.setItem(THEME_KEY, theme);

    let isDark = true;
    if (theme === 'light') {
      isDark = false;
    } else if (theme === 'system') {
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    document.documentElement.classList.toggle('ion-palette-dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Sync Capacitor Status Bar
    try {
      StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: isDark ? '#07090e' : '#f8fafc' }).catch(() => {});
    } catch {
      // Ignored if in browser or unsupported
    }
  }

  public static isDarkMode(): boolean {
    if (this.currentTheme === 'light') return false;
    if (this.currentTheme === 'dark') return true;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
