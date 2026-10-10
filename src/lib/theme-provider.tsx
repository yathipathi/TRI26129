'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type SkinType = 'material3' | 'fluent2';

interface ThemeContextType {
  themeMode: ThemeMode;
  skin: SkinType;
  resolvedTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  setSkin: (skin: SkinType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper for safe localStorage access without throwing SecurityError in sandboxed contexts
function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch {
    // Return null if sandboxed or blocked
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore if sandboxed or blocked
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [skin, setSkinState] = useState<SkinType>('material3');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = safeGetItem('siteforge_theme_mode') as ThemeMode;
    const savedSkin = safeGetItem('siteforge_skin') as SkinType;

    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeModeState(savedTheme);
    }
    if (savedSkin && ['material3', 'fluent2'].includes(savedSkin)) {
      setSkinState(savedSkin);
    }
  }, []);

  // Sync theme class & skin class on html root element
  useEffect(() => {
    const root = document.documentElement;

    // Detect system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const computeResolved = (mode: ThemeMode): 'light' | 'dark' => {
      if (mode === 'system') {
        return mediaQuery.matches ? 'dark' : 'light';
      }
      return mode;
    };

    const actual = computeResolved(themeMode);
    setResolvedTheme(actual);

    // Apply dark mode class
    if (actual === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply skin class
    root.classList.remove('skin-material3', 'skin-fluent2');
    root.classList.add(`skin-${skin}`);

    // Set dataset attributes for easy CSS selector access
    root.dataset.theme = actual;
    root.dataset.skin = skin;

    // Listener for system theme change
    const handleChange = () => {
      if (themeMode === 'system') {
        const sysActual = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(sysActual);
        if (sysActual === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, skin]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    safeSetItem('siteforge_theme_mode', mode);
  };

  const setSkin = (newSkin: SkinType) => {
    setSkinState(newSkin);
    safeSetItem('siteforge_skin', newSkin);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'light' ? 'dark' : 'light';
    setThemeMode(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        skin,
        resolvedTheme,
        setThemeMode,
        setSkin,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      themeMode: 'system' as ThemeMode,
      skin: 'material3' as SkinType,
      resolvedTheme: 'light' as 'light' | 'dark',
      setThemeMode: () => {},
      setSkin: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
