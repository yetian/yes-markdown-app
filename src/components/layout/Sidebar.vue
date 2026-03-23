<script setup lang="ts">
import { ref } from 'vue'
import NoteTree from '@/components/notes/NoteTree.vue'
import { useNotesStore } from '@/stores/notes'
import { useI18nStore } from '@/stores/i18n'

const notesStore = useNotesStore()
const i18nStore = useI18nStore()
const searchQuery = ref('')

function handleCreateNote() {
  const note = notesStore.createNote()
  notesStore.selectNote(note.id)
}

function handleCreateFolder() {
  notesStore.createFolder()
}
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1 class="app-title">
        <i class="fa-solid fa-feather"></i>
        Yes Markdown
      </h1>
    </div>

    <div class="sidebar-actions">
      <button class="btn btn-primary btn-sm" @click="handleCreateNote">
        <i class="fa-solid fa-plus"></i>
        {{ i18nStore.t('newNote') }}
      </button>
      <button class="btn btn-ghost btn-sm" @click="handleCreateFolder">
        <i class="fa-solid fa-folder-plus"></i>
        {{ i18nStore.t('folder') }}
      </button>
    </div>

    <div class="sidebar-search">
      <div class="search-input-wrapper">
        <i class="fa-solid fa-search search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          class="input search-input"
          :placeholder="i18nStore.t('searchPlaceholder')"
        />
      </div>
    </div>

    <div class="sidebar-tree">
      <NoteTree :search-query="searchQuery" />
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  min-height: 36px;
  box-sizing: border-box;
}

.app-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.app-title i {
  color: var(--accent-color);
}

.header-actions {
  display: flex;
  gap: 0.25rem;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  min-width: 200px;
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  z-index: 100;
  animation: slideUp 0.2s ease;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.menu-item:hover {
  background: var(--bg-hover);
}

.menu-item.divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.375rem 0;
  padding: 0;
}

.sidebar-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-search {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

.search-input {
  padding-left: 2.5rem;
}

.sidebar-tree {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}
</style>
