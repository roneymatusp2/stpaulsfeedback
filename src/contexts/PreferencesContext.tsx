import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type ThemeMode = 'system' | 'light' | 'dark'

type AccentPreset =
  | 'ruby'
  | 'indigo'
  | 'britishGreen'
  | 'emerald'
  | 'violet'
  | 'amber'

type FontPreset = 'system' | 'inter' | 'serif' | 'mono'

export interface Preferences {
  theme: ThemeMode
  accent: AccentPreset
  font: FontPreset
}

interface PreferencesContextValue extends Preferences {
  setTheme: (mode: ThemeMode) => void
  setAccent: (accent: AccentPreset) => void
  setFont: (font: FontPreset) => void
  reset: () => void
}

const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  accent: 'britishGreen',
  font: 'system'
}

const STORAGE_KEY = 'sps-preferences'

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined)

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', isDark)
}

function applyAccent(accent: AccentPreset) {
  const root = document.documentElement
  // All colours as HSL to be compatible with design tokens
  const accentMap: Record<AccentPreset, string> = {
    ruby: '350 100% 25.5%',
    indigo: '201 100% 9.4%',
    britishGreen: '158 100% 7.5%',
    emerald: '152 76% 35%',
    violet: '262 83% 58%',
    amber: '38 92% 50%'
  }
  root.style.setProperty('--accent', accentMap[accent])
}

function applyFont(font: FontPreset) {
  const root = document.documentElement
  const fontMap: Record<FontPreset, string> = {
    system: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    inter: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    serif: 'Georgia, Cambria, Times New Roman, Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  }
  root.style.setProperty('--app-font', fontMap[font])
}

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<Preferences>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
    } catch {}
    return DEFAULT_PREFERENCES
  })

  // Apply on mount and when preferences change
  useEffect(() => {
    applyTheme(prefs.theme)
    applyAccent(prefs.accent)
    applyFont(prefs.font)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {}
  }, [prefs])

  // React to system theme changes when on 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (prefs.theme === 'system') applyTheme('system')
    }
    try {
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } catch {
      // Safari fallback
      mq.addListener(handler)
      return () => mq.removeListener(handler)
    }
  }, [prefs.theme])

  const value = useMemo<PreferencesContextValue>(() => ({
    ...prefs,
    setTheme: (mode) => setPrefs((p) => ({ ...p, theme: mode })),
    setAccent: (accent) => setPrefs((p) => ({ ...p, accent })),
    setFont: (font) => setPrefs((p) => ({ ...p, font })),
    reset: () => setPrefs(DEFAULT_PREFERENCES)
  }), [prefs])

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return ctx
}


