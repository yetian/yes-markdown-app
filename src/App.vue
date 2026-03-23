<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Editor from '@/components/layout/Editor.vue'
import Preview from '@/components/layout/Preview.vue'
import TagSidebar from '@/components/notes/TagSidebar.vue'
import { useThemeStore } from '@/stores/theme'
import { useI18nStore, localeOptions } from '@/stores/i18n'
import { useNotesStore } from '@/stores/notes'
import { exportNote, exportAllNotes } from '@/utils/export'
import { renderMarkdown } from '@/utils/markdown'

type SidebarTab = 'files' | 'tags' | 'settings' | null
const activeTab = ref<SidebarTab>('files')
const sidebarWidth = ref(220)
const isResizing = ref(false)
const themeStore = useThemeStore()
const isSidebarVisible = ref(true)
const i18nStore = useI18nStore()
const notesStore = useNotesStore()
const showExportMenu = ref(false)

function handleExportCurrentNote(format: 'md' | 'html') {
  if (notesStore.currentNote) {
    const renderedContent = format === 'html' ? renderMarkdown(notesStore.currentNote.content) : undefined
    exportNote(notesStore.currentNote, format, renderedContent)
  }
  showExportMenu.value = false
}

function handleExportAll(format: 'md' | 'html' | 'json') {
  exportAllNotes(
    notesStore.rootItems,
    format,
    true,
    format === 'html' ? renderMarkdown : undefined
  )
  showExportMenu.value = false
}

function handleTabClick(tab: SidebarTab) {
  if (activeTab.value === tab) {
    // Toggle sidebar off
    isSidebarVisible.value = false
    setTimeout(() => {
      activeTab.value = null
    }, 200)
  } else {
    // Show sidebar with new tab
    if (!isSidebarVisible.value) {
      isSidebarVisible.value = true
    }
    activeTab.value = tab
  }
}

function startResize(e: MouseEvent) {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(e: MouseEvent) {
  if (isResizing.value) {
    const newWidth = e.clientX - 40
    sidebarWidth.value = Math.max(160, Math.min(320, newWidth))
  }
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// Watch tab changes to animate
watch(activeTab, () => {
  // Trigger any animations when tab changes
})
</script>

<template>
  <div class="app-container">
    <!-- Activity Bar -->
    <div class="activity-bar">
      <button
        class="activity-btn"
        :class="{ active: activeTab === 'files' }"
        @click="handleTabClick('files')"
        :title="i18nStore.t('files')"
      >
        <i class="fa-solid fa-folder-tree"></i>
      </button>
      <button
        class="activity-btn"
        :class="{ active: activeTab === 'tags' }"
        @click="handleTabClick('tags')"
        :title="i18nStore.t('tags')"
      >
        <i class="fa-solid fa-tags"></i>
      </button>
      <div class="activity-spacer"></div>
      <button
        class="activity-btn"
        :class="{ active: activeTab === 'settings' }"
        @click="handleTabClick('settings')"
        :title="i18nStore.t('settings')"
      >
        <i class="fa-solid fa-gear"></i>
      </button>
    </div>

    <!-- Sidebar -->
    <Transition name="slide">
      <div
        v-show="isSidebarVisible"
        class="sidebar"
        :style="{ width: sidebarWidth + 'px', minWidth: sidebarWidth + 'px' }"
      >
        <Transition name="fade" mode="out-in">
          <Sidebar v-if="activeTab === 'files'" key="files" />
          <TagSidebar v-else-if="activeTab === 'tags'" key="tags" />
          <div v-else-if="activeTab === 'settings'" key="settings" class="settings-panel">
            <div class="settings-header">
              <h3><i class="fa-solid fa-gear"></i> {{ i18nStore.t('settings') }}</h3>
            </div>
            <div class="settings-content">
              <div class="setting-item">
                <span class="setting-label">{{ i18nStore.t('theme') }}</span>
                <div class="theme-toggle">
                  <button
                    class="theme-btn"
                    :class="{ active: themeStore.mode === 'light' }"
                    @click="themeStore.setTheme('light')"
                    :title="i18nStore.t('light')"
                  >
                    <i class="fa-solid fa-sun"></i>
                  </button>
                  <button
                    class="theme-btn"
                    :class="{ active: themeStore.mode === 'dark' }"
                    @click="themeStore.setTheme('dark')"
                    :title="i18nStore.t('dark')"
                  >
                    <i class="fa-solid fa-moon"></i>
                  </button>
                </div>
              </div>
              <div class="setting-item">
                <span class="setting-label">{{ i18nStore.t('language') }}</span>
                <div class="language-flags">
                  <button
                    v-for="option in localeOptions"
                    :key="option.code"
                    class="flag-btn"
                    :class="{ active: i18nStore.locale === option.code }"
                    @click="i18nStore.setLocale(option.code)"
                  >
                    <span class="flag-icon">{{ option.flag }}</span>
                    <span class="flag-name">{{ option.nativeName }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Resize Handle -->
        <div
          class="resize-handle"
          @mousedown="startResize"
        ></div>
      </div>
    </Transition>

    <Editor class="editor" />
    <Preview class="preview" />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg-primary);
}

/* Activity Bar */
.activity-bar {
  width: 40px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0;
}

.activity-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  position: relative;
  overflow: hidden;
}

.activity-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.2s;
}

.activity-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-hover);
  transform: scale(1.05);
}

.activity-btn:hover::before {
  opacity: 1;
}

.activity-btn.active {
  color: var(--accent-color);
  background: var(--accent-light);
  transform: scale(1.05);
}

.activity-btn.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--accent-color);
  border-radius: 0 3px 3px 0;
}

.activity-spacer {
  flex: 1;
}

/* Sidebar */
.sidebar {
  position: relative;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  flex-shrink: 0;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
  transition: background 0.15s;
}

.resize-handle:hover {
  background: var(--accent-color);
  opacity: 0.4;
}

/* Settings Panel */
.settings-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.settings-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.settings-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-bottom: 0.5rem;
}

.theme-toggle {
  display: flex;
  gap: 0.5rem;
}

.theme-btn {
  flex: 1;
  padding: 0.625rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.theme-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.theme-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
}

.width-slider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: var(--border-color);
  border-radius: 2px;
  outline: none;
  transition: background 0.15s;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 102, 255, 0.3);
}

.width-value {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  min-width: 45px;
  text-align: right;
}

.language-flags {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.flag-btn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.flag-btn:hover {
  background: var(--bg-hover);
}

.flag-btn.active {
  border-color: var(--accent-color);
  background: var(--accent-light);
}

.flag-icon {
  font-size: 1.25rem;
}

.flag-name {
  font-weight: 500;
}

.editor {
  flex: 1;
  min-width: 250px;
  background: var(--editor-bg);
  border-right: 1px solid var(--border-color);
}

.preview {
  flex: 1;
  min-width: 250px;
  background: var(--preview-bg);
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
