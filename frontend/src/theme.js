const STORAGE_KEY = 'codescope:theme'

export function getTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* storage unavailable */
  }
  // Dark is the default option per the design system.
  return 'dark'
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
}

export function setTheme(theme) {
  applyTheme(theme)
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* storage unavailable */
  }
}

export function initTheme() {
  applyTheme(getTheme())
}
