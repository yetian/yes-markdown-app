import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Note, Folder, TreeItem, Tag } from '@/types'

const STORAGE_KEY = 'yes-markdown-data'

export const useNotesStore = defineStore('notes', () => {
  const rootItems = ref<TreeItem[]>([])
  const tags = ref<Tag[]>([])
  const currentNoteId = ref<string | null>(null)
  const currentFolderId = ref<string | null>(null)

  const currentNote = computed(() => {
    if (!currentNoteId.value) return null
    return findNoteById(rootItems.value, currentNoteId.value)
  })

  const currentFolder = computed(() => {
    if (!currentFolderId.value) return null
    return findFolderById(rootItems.value, currentFolderId.value)
  })

  function findNoteById(items: TreeItem[], id: string): Note | null {
    for (const item of items) {
      if (item.type === 'note' && item.id === id) {
        return item
      }
      if (item.type === 'folder') {
        const found = findNoteById(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  function createNote(parentId?: string): Note {
    const note: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      type: 'note'
    }

    // Use provided parentId, or currentFolderId if set, or root
    const targetFolderId = parentId || currentFolderId.value

    if (targetFolderId) {
      const parent = findFolderById(rootItems.value, targetFolderId)
      if (parent) {
        parent.children.push(note)
      } else {
        rootItems.value.push(note)
      }
    } else {
      rootItems.value.push(note)
    }

    saveToStorage()
    return note
  }

  function findFolderById(items: TreeItem[], id: string): Folder | null {
    for (const item of items) {
      if (item.type === 'folder' && item.id === id) {
        return item
      }
      if (item.type === 'folder') {
        const found = findFolderById(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  function createFolder(parentId?: string): Folder {
    const folder: Folder = {
      id: generateId(),
      name: 'New Folder',
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      type: 'folder'
    }

    if (parentId) {
      const parent = findFolderById(rootItems.value, parentId)
      if (parent) {
        parent.children.push(folder)
      }
    } else {
      rootItems.value.push(folder)
    }

    saveToStorage()
    return folder
  }

  function selectNote(id: string) {
    currentNoteId.value = id
    // Clear folder selection when selecting a note
    currentFolderId.value = null
  }

  function selectFolder(id: string | null) {
    currentFolderId.value = id
    // Clear note selection when selecting a folder
    if (id) currentNoteId.value = null
  }

  function updateNoteTitle(id: string, title: string) {
    const note = findNoteById(rootItems.value, id)
    if (note) {
      note.title = title
      note.updatedAt = Date.now()
      saveToStorage()
    }
  }

  function updateNoteContent(id: string, content: string) {
    const note = findNoteById(rootItems.value, id)
    if (note) {
      note.content = content
      note.updatedAt = Date.now()
      saveToStorage()
    }
  }

  function deleteNote(id: string) {
    deleteItem(rootItems.value, id)
    if (currentNoteId.value === id) {
      currentNoteId.value = null
    }
    saveToStorage()
  }

  function deleteFolder(id: string) {
    deleteItem(rootItems.value, id)
    saveToStorage()
  }

  function deleteItem(items: TreeItem[], id: string): boolean {
    const index = items.findIndex(item => item.id === id)
    if (index !== -1) {
      items.splice(index, 1)
      return true
    }
    for (const item of items) {
      if (item.type === 'folder' && deleteItem(item.children, id)) {
        return true
      }
    }
    return false
  }

  // Tag functions
  function createTag(name: string, color: string = '#3B82F6'): Tag {
    const tag: Tag = {
      id: generateId(),
      name,
      color
    }
    tags.value.push(tag)
    saveToStorage()
    return tag
  }

  function updateTag(id: string, name: string, color: string) {
    const tag = tags.value.find(t => t.id === id)
    if (tag) {
      tag.name = name
      tag.color = color
      saveToStorage()
    }
  }

  function deleteTag(id: string) {
    const index = tags.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tags.value.splice(index, 1)
      // Remove tag from all notes
      removeTagFromAllNotes(id)
      saveToStorage()
    }
  }

  function removeTagFromAllNotes(tagId: string) {
    function removeFromItems(items: TreeItem[]) {
      for (const item of items) {
        if (item.type === 'note') {
          item.tags = item.tags.filter(t => t !== tagId)
        } else if (item.type === 'folder') {
          removeFromItems(item.children)
        }
      }
    }
    removeFromItems(rootItems.value)
  }

  function addTagToNote(noteId: string, tagId: string) {
    const note = findNoteById(rootItems.value, noteId)
    if (note) {
      // Only one tag per note - replace existing
      note.tags = [tagId]
      note.updatedAt = Date.now()
      saveToStorage()
    }
  }

  function removeTagFromNote(noteId: string, tagId: string) {
    const note = findNoteById(rootItems.value, noteId)
    if (note) {
      note.tags = note.tags.filter(t => t !== tagId)
      note.updatedAt = Date.now()
      saveToStorage()
    }
  }

  function setNoteTag(noteId: string, tagId: string | null) {
    const note = findNoteById(rootItems.value, noteId)
    if (note) {
      note.tags = tagId ? [tagId] : []
      note.updatedAt = Date.now()
      saveToStorage()
    }
  }

  function getTagColor(tagId: string): string {
    const tag = tags.value.find(t => t.id === tagId)
    return tag?.color || '#6B7280'
  }

  function getTagById(tagId: string): Tag | undefined {
    return tags.value.find(t => t.id === tagId)
  }

  function saveToStorage() {
    const data = {
      rootItems: rootItems.value,
      tags: tags.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        rootItems.value = data.rootItems || []
        tags.value = data.tags || []
      } catch {
        rootItems.value = []
        tags.value = []
      }
    }
  }

  // Initialize on load
  loadFromStorage()

  return {
    rootItems,
    tags,
    currentNoteId,
    currentFolderId,
    currentNote,
    currentFolder,
    createNote,
    createFolder,
    selectNote,
    selectFolder,
    updateNoteTitle,
    updateNoteContent,
    deleteNote,
    deleteFolder,
    // Tag functions
    createTag,
    updateTag,
    deleteTag,
    addTagToNote,
    removeTagFromNote,
    setNoteTag,
    getTagColor,
    getTagById,
    saveToStorage
  }
})
