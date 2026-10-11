import { ref } from 'vue'

const STORAGE_KEY = 'dailyy_theme_v1'

export const THEMES = [
  {
    id: 'indigo-dark',
    name: 'Indigo Night',
    category: 'Gelap Bawaan',
    type: 'dark',
    swatch: '#6366f1',
    bgPreview: '#020617',
    metaTheme: '#020617'
  },
  {
    id: 'sky-light',
    name: 'Biru Samudra',
    category: 'Biru Berpendar',
    type: 'dark',
    swatch: '#0ea5e9',
    bgPreview: '#031726',
    metaTheme: '#031726'
  },
  {
    id: 'blush-pink',
    name: 'Blush Pink',
    category: 'Kaum Hawa',
    type: 'dark',
    swatch: '#f43f5e',
    bgPreview: '#1f0310',
    metaTheme: '#1f0310'
  },
  {
    id: 'emerald-nature',
    name: 'Emerald Green',
    category: 'Hijau Alami',
    type: 'dark',
    swatch: '#10b981',
    bgPreview: '#022c22',
    metaTheme: '#022c22'
  }
]

const currentTheme = ref('indigo-dark')

const applyThemeToDOM = (themeId) => {
  const selected = THEMES.find((t) => t.id === themeId) || THEMES[0]
  const root = document.documentElement

  // Set data-theme attribute
  root.setAttribute('data-theme', selected.id)

  // Always dark class for all 4 dark glowing themes
  root.classList.add('dark')
  root.classList.remove('light')

  // Update browser status bar meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.setAttribute('content', selected.metaTheme)
  }

  // Update iOS Safari standalone status bar text brightness (black-translucent = white text)
  const appleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  if (appleStatus) {
    appleStatus.setAttribute('content', 'black-translucent')
  }
}

// Inisialisasi tema dari LocalStorage saat modul termuat
const initTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && THEMES.some((t) => t.id === saved)) {
      currentTheme.value = saved
    } else {
      currentTheme.value = 'indigo-dark'
    }
  } catch (e) {
    currentTheme.value = 'indigo-dark'
  }
  applyThemeToDOM(currentTheme.value)
}

initTheme()

export function useTheme() {
  const setTheme = (themeId) => {
    if (!THEMES.some((t) => t.id === themeId)) return
    currentTheme.value = themeId
    try {
      localStorage.setItem(STORAGE_KEY, themeId)
    } catch (e) {
      console.warn('Gagal menyimpan tema ke LocalStorage:', e)
    }
    applyThemeToDOM(themeId)
  }

  return {
    themes: THEMES,
    currentTheme,
    setTheme
  }
}

