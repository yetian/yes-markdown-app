<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNotesStore } from '@/stores/notes'

const notesStore = useNotesStore()

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingTagId = ref<string | null>(null)
const newTagName = ref('')
const newTagColor = ref('#3B82F6')

const allTags = computed(() => notesStore.tags)
const notesCountByTag = computed(() => {
  const counts: Record<string, number> = {}
  function countNotes(items: any[]) {
    for (const item of items) {
      if (item.type === 'note' && item.tags && item.tags.length > 0) {
        for (const tagId of item.tags) {
          counts[tagId] = (counts[tagId] || 0) + 1
        }
      } else if (item.type === 'folder') {
        countNotes(item.children)
      }
    }
  }
  countNotes(notesStore.rootItems)
  return counts
})

function openCreateDialog() {
  editingTagId.value = null
  newTagName.value = ''
  newTagColor.value = '#3B82F6'
  showCreateDialog.value = true
}

function openEditDialog(tag: any) {
  editingTagId.value = tag.id
  newTagName.value = tag.name
  newTagColor.value = tag.color
  showEditDialog.value = true
}

function handleSaveTag() {
  if (!newTagName.value.trim()) return
  if (editingTagId.value) {
    notesStore.updateTag(editingTagId.value, newTagName.value.trim(), newTagColor.value)
    showEditDialog.value = false
  } else {
    notesStore.createTag(newTagName.value.trim(), newTagColor.value)
    showCreateDialog.value = false
  }
}

function handleDeleteTag(tagId: string) {
  notesStore.deleteTag(tagId)
  showEditDialog.value = false
}

const presetColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1'
]
</script>

<template>
  <div class="tag-sidebar">
    <div class="sidebar-header">
      <h3><i class="fa-solid fa-tags"></i> Tags</h3>
      <button class="btn-icon-sm" @click="openCreateDialog" title="Create new tag">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>

    <div class="tag-list">
      <div v-if="allTags.length === 0" class="empty-state">
        <p>No tags yet</p>
        <button class="btn-link" @click="openCreateDialog">Create your first tag</button>
      </div>

      <div
        v-for="tag in allTags"
        :key="tag.id"
        class="tag-item"
        @click="openEditDialog(tag)"
      >
        <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
        <span class="tag-name">{{ tag.name }}</span>
        <span class="tag-count">{{ notesCountByTag[tag.id] || 0 }}</span>
        <i class="fa-solid fa-chevron-right tag-arrow"></i>
      </div>
    </div>

    <!-- Create Dialog -->
    <Teleport to="body">
      <div v-if="showCreateDialog" class="dialog-overlay" @click="showCreateDialog = false">
        <div class="dialog glass" @click.stop>
          <div class="dialog-header">
            <h3>Create Tag</h3>
            <button class="close-btn" @click="showCreateDialog = false">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="dialog-body">
            <div class="form-field">
              <label>Name</label>
              <input v-model="newTagName" type="text" class="input" placeholder="Tag name" />
            </div>
            <div class="form-field">
              <label>Color</label>
              <div class="color-picker">
                <button
                  v-for="color in presetColors"
                  :key="color"
                  class="color-option"
                  :class="{ selected: newTagColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="newTagColor = color"
                >
                  <i v-if="newTagColor === color" class="fa-solid fa-check"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn btn-ghost" @click="showCreateDialog = false">Cancel</button>
            <button class="btn btn-primary" @click="handleSaveTag">Create</button>
          </div>
        </div>
      </div>

      <!-- Edit Dialog -->
      <div v-if="showEditDialog" class="dialog-overlay" @click="showEditDialog = false">
        <div class="dialog glass" @click.stop>
          <div class="dialog-header">
            <h3>Edit Tag</h3>
            <button class="close-btn" @click="showEditDialog = false">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="dialog-body">
            <div class="form-field">
              <label>Name</label>
              <input v-model="newTagName" type="text" class="input" placeholder="Tag name" />
            </div>
            <div class="form-field">
              <label>Color</label>
              <div class="color-picker">
                <button
                  v-for="color in presetColors"
                  :key="color"
                  class="color-option"
                  :class="{ selected: newTagColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="newTagColor = color"
                >
                  <i v-if="newTagColor === color" class="fa-solid fa-check"></i>
                </button>
              </div>
            </div>
            <div class="tag-preview">
              Preview: <span class="tag-chip" :style="{ backgroundColor: newTagColor }">{{ newTagName || 'Tag name' }}</span>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn btn-danger" @click="handleDeleteTag(editingTagId!)">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
            <div class="dialog-actions">
              <button class="btn btn-ghost" @click="showEditDialog = false">Cancel</button>
              <button class="btn btn-primary" @click="handleSaveTag">Save</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tag-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon-sm {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-icon-sm:hover {
  background: var(--accent-light);
  color: var(--accent-color);
}

.tag-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-tertiary);
}

.btn-link {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.btn-link:hover {
  text-decoration: underline;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 0.25rem;
}

.tag-item:hover {
  background: var(--bg-hover);
}

.tag-color {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

.tag-name {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.tag-count {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}

.tag-arrow {
  font-size: 0.625rem;
  color: var(--text-tertiary);
  opacity: 0;
  transition: opacity 0.15s;
}

.tag-item:hover .tag-arrow {
  opacity: 1;
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  width: 340px;
  background: var(--bg-primary);
  padding: 1.25rem;
  border-radius: 16px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.dialog-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.color-picker {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-option {
  width: 28px;
  height: 28px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  transition: transform 0.15s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: var(--text-primary);
}

.tag-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.tag-chip {
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  color: white;
  font-size: 0.8125rem;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.dialog-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-danger {
  background: transparent;
  color: var(--danger-color);
}

.btn-danger:hover {
  background: var(--danger-color);
  color: white;
}
</style>
