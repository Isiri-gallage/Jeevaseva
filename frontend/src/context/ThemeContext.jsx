import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'raktaseva-theme';

const ThemeContext = createContext(null);

/** Read the saved preference, falling back to 'system'. */
const readStored = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  } catch {
    // Private browsing or a blocked storage policy — fall back rather than crash.
    return 'system';
  }
};

const prefersDark = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const ThemeProvider = ({ children }) => {
  // 'system' | 'light' | 'dark' — what the user chose.
  const [preference, setPreference] = useState(readStored);
  // 'light' | 'dark' — what is actually rendered right now.
  const [resolved, setResolved] = useState(() =>
    readStored() === 'system' ? (prefersDark() ? 'dark' : 'light') : readStored()
  );

  // Keep `resolved` in sync with the OS while the preference is 'system'.
  useEffect(() => {
    if (preference !== 'system') {
      setResolved(preference);
      return undefined;
    }

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setResolved(query.matches ? 'dark' : 'light');
    sync();

    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [preference]);

  // Apply to the document root, suppressing transitions for one frame.
  useEffect(() => {
    const root = document.documentElement;

    root.classList.add('theme-switching');
    root.setAttribute('data-theme', resolved);

    // Two rAFs: the first lets the browser apply the new attribute, the second
    // runs after that paint so removing the class cannot re-trigger the
    // transitions we just suppressed.
    let inner;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => root.classList.remove('theme-switching'));
    });

    // Keeps native controls (scrollbars, form widgets, autofill) in the right
    // appearance — CSS variables alone do not reach them.
    root.style.colorScheme = resolved;

    return () => {
      cancelAnimationFrame(outer);
      if (inner) cancelAnimationFrame(inner);
    };
  }, [resolved]);

  const setTheme = useCallback((next) => {
    setPreference(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference simply will not persist; the app still works.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setTheme]);

  const value = useMemo(
    () => ({ theme: resolved, preference, setTheme, toggleTheme, isDark: resolved === 'dark' }),
    [resolved, preference, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }
  return context;
};
