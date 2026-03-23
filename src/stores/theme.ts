import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem('theme-mode')
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(getInitialTheme())

  function toggleTheme() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(newMode: ThemeMode) {
    mode.value = newMode
  }

  watch(mode, (newMode) => {
    localStorage.setItem('theme-mode', newMode)
    document.documentElement.setAttribute('data-theme', newMode)
  }, { immediate: true })

  return {
    mode,
    toggleTheme,
    setTheme
  }
})
