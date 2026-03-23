<script setup lang="ts">
import { computed } from 'vue'
import { useNotesStore } from '@/stores/notes'

const notesStore = useNotesStore()

const currentNote = computed(() => notesStore.currentNote)
const allTags = computed(() => notesStore.tags)

// Get the current tag of the note (only one tag per note)
const currentTagId = computed(() => {
  if (!currentNote.value || currentNote.value.tags.length === 0) return null
  return currentNote.value.tags[0]
})

const currentTag = computed(() => {
  if (!currentTagId.value) return null
  return notesStore.getTagById(currentTagId.value)
})

function handleSelectTag(tagId: string) {
  if (currentNote.value) {
    // Replace current tag with new one (only one tag per note)
    notesStore.addTagToNote(currentNote.value.id, tagId)
  }
}

function handleRemoveTag() {
  if (currentNote.value && currentTagId.value) {
    notesStore.removeTagFromNote(currentNote.value.id, currentTagId.value)
  }
}
</script>

<template>
  <div class="tag-manager" v-if="currentNote">
    <div class="tag-section">
      <span class="tag-label">Tag</span>
      <div class="current-tag" v-if="currentTag">
        <span class="tag-chip" :style="{ backgroundColor: currentTag.color }">
          {{ currentTag.name }}
        </span>
        <button class="remove-btn" @click="handleRemoveTag" title="Remove tag">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <span v-else class="no-tag">No tag</span>
    </div>

    <div class="tag-section" v-if="allTags.length > 0">
      <span class="tag-label">Change</span>
      <div class="tag-options">
        <button
          v-for="tag in allTags"
          :key="tag.id"
          class="tag-option"
          :class="{ active: currentTagId === tag.id }"
          :style="{
            borderColor: tag.color,
            color: currentTagId === tag.id ? 'white' : tag.color,
            backgroundColor: currentTagId === tag.color ? tag.color : 'transparent'
          }"
          @click="handleSelectTag(tag.id)"
        >
          {{ tag.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-manager {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.tag-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.tag-section:last-child { margin-bottom: 0; }

.tag-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  min-width: 3rem;
}

.current-tag {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  border-radius: 6px;
}

.remove-btn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 0.625rem;
}

.remove-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.no-tag {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-style: italic;
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag-option {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1.5px solid;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.tag-option:hover {
  opacity: 0.8;
}

.tag-option.active {
  color: white;
}
</style>
