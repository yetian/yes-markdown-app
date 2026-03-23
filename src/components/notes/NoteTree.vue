<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotesStore } from '@/stores/notes'
import draggable from 'vuedraggable'
import JSZip from 'jszip'
import { renderMarkdown } from '@/utils/markdown'
import type { TreeItem, Folder, Note } from '@/types'

const props = defineProps<{
  searchQuery?: string
}>()

const notesStore = useNotesStore()
const expandedFolders = ref<Set<string>>(new Set())
const showDeleteDialog = ref(false)
const itemToDelete = ref<TreeItem | null>(null)

// Context menu
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuItem = ref<TreeItem | null>(null)

const items = computed({
  get: () => {
    if (!props.searchQuery?.trim()) return notesStore.rootItems
    const query = props.searchQuery.toLowerCase()
    return filterItems(notesStore.rootItems, query)
  },
  set: (value) => {
    notesStore.rootItems = value
    notesStore.saveToStorage()
  }
})

function filterItems(items: TreeItem[], query: string): TreeItem[] {
  return items.reduce((acc: TreeItem[], item) => {
    if (item.type === 'note' && item.title.toLowerCase().includes(query)) {
      acc.push(item)
    } else if (item.type === 'folder') {
      const children = filterItems(item.children, query)
      if (children.length > 0) acc.push({ ...item, children })
    }
    return acc
  }, [])
}

function handleSelect(item: TreeItem) {
  closeContextMenu()
  if (item.type === 'note') {
    notesStore.selectNote(item.id)
  } else {
    notesStore.selectFolder(item.id)
    toggleFolder(item.id)
  }
}

function confirmDelete(item: TreeItem) {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

function handleDelete() {
  if (!itemToDelete.value) return
  if (itemToDelete.value.type === 'note') {
    notesStore.deleteNote(itemToDelete.value.id)
  } else {
    notesStore.deleteFolder(itemToDelete.value.id)
  }
  showDeleteDialog.value = false
  itemToDelete.value = null
}

function cancelDelete() {
  showDeleteDialog.value = false
  itemToDelete.value = null
}

// Context menu handlers
function handleContextMenu(event: MouseEvent, item: TreeItem) {
  event.preventDefault()
  contextMenuItem.value = item
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  showContextMenu.value = true

  // Remove old listener if any
  document.removeEventListener('click', handleClickOutside)

  // Add click outside listener
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  const contextMenu = document.querySelector('.context-menu')
  if (contextMenu && !contextMenu.contains(target)) {
    closeContextMenu()
  }
}

function closeContextMenu() {
  showContextMenu.value = false
  contextMenuItem.value = null
  document.removeEventListener('click', handleClickOutside)
}

function handleDragEnd() {
  notesStore.saveToStorage()
}

function getNoteTag(note: Note): string | null {
  const tags = note.tags || []
  return tags.length > 0 ? tags[0] : null
}

function toggleFolder(folderId: string) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId)
  } else {
    expandedFolders.value.add(folderId)
  }
}

function isFolderExpanded(folderId: string): boolean {
  return expandedFolders.value.has(folderId)
}

function handleAddNoteToFolder(folderId: string) {
  const note = notesStore.createNote(folderId)
  notesStore.selectNote(note.id)
  expandedFolders.value.add(folderId)
}

// Tag menu
const allTags = computed(() => notesStore.tags)

function handleSetTag(tagId: string) {
  if (contextMenuItem.value && contextMenuItem.value.type === 'note') {
    const currentTag = getNoteTag(contextMenuItem.value as Note)
    if (currentTag === tagId) {
      // Toggle off if clicking already selected tag
      notesStore.removeTagFromNote(contextMenuItem.value.id, tagId)
    } else {
      notesStore.addTagToNote(contextMenuItem.value.id, tagId)
    }
  }
  closeContextMenu()
}

// Export functions
function exportNoteAsFile(note: Note, format: 'md' | 'html') {
  const filename = `${note.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.${format}`
  let content: string

  if (format === 'md') {
    content = note.content
  } else {
    // Use proper markdown rendering for HTML export
    const renderedContent = renderMarkdown(note.content)
    content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${note.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    pre { background: #f6f8fa; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { background: #f6f8fa; padding: 0.125rem 0.375rem; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', monospace; }
    blockquote { border-left: 4px solid #0066ff; padding-left: 1rem; color: #666; margin: 1rem 0; }
    h1, h2, h3 { color: #1a1a1a; margin-top: 1.5rem; }
    a { color: #0066ff; }
    img { max-width: 100%; }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  ${renderedContent}
</body>
</html>`
  }

  downloadFile(content, filename, format === 'html' ? 'text/html' : 'text/markdown')
}

async function exportFolderAsZip(event: MouseEvent, folder: Folder) {
  event.preventDefault()
  event.stopPropagation()
  console.log('Export folder as zip:', folder.name)
  const zip = new JSZip()
  const folderName = folder.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')

  function addItemsToZip(items: TreeItem[], currentFolder: JSZip) {
    for (const item of items) {
      if (item.type === 'note') {
        const note = item as Note
        const filename = `${note.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.md`
        currentFolder.file(filename, note.content)
      } else if (item.type === 'folder') {
        const subFolder = currentFolder.folder((item as Folder).name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_'))
        if (subFolder) {
          addItemsToZip((item as Folder).children, subFolder)
        }
      }
    }
  }

  addItemsToZip(folder.children, zip)

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${folderName}.zip`
  a.click()
  URL.revokeObjectURL(url)
  closeContextMenu()
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  closeContextMenu()
}

function handleExportNote(event: MouseEvent, format: 'md' | 'html') {
  event.preventDefault()
  event.stopPropagation()
  console.log('Export note:', format, contextMenuItem.value?.title)
  if (contextMenuItem.value && contextMenuItem.value.type === 'note') {
    exportNoteAsFile(contextMenuItem.value as Note, format)
  }
}
</script>

<template>
  <div class="note-tree">
    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fa-solid fa-folder-open"></i>
      </div>
      <p class="empty-text">No notes yet</p>
      <p class="empty-hint">Create your first note to get started</p>
    </div>

    <draggable
      v-else
      v-model="items"
      group="notes"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost"
      animation="200"
      @end="handleDragEnd"
      class="tree-list"
    >
      <template #item="{ element }">
        <div class="tree-item-wrapper">
          <div
            v-if="element.type === 'note'"
            class="tree-item"
            :class="{ selected: element.id === notesStore.currentNoteId }"
            @click="handleSelect(element)"
            @contextmenu="handleContextMenu($event, element)"
          >
            <button class="drag-handle" @click.stop>
              <i class="fa-solid fa-grip-vertical"></i>
            </button>
            <i class="fa-solid fa-file-lines item-icon"></i>
            <span class="item-name">{{ element.title }}</span>
            <div class="item-tags" v-if="getNoteTag(element)">
              <span
                class="tag-dot"
                :style="{ backgroundColor: notesStore.getTagColor(getNoteTag(element)!) }"
              ></span>
            </div>
            <button class="delete-btn" @click.stop="confirmDelete(element)">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>

          <div v-else class="folder-item">
            <div
              class="folder-header"
              :class="{ selected: element.id === notesStore.currentFolderId }"
              @click="handleSelect(element)"
            >
              <button class="drag-handle" @click.stop>
                <i class="fa-solid fa-grip-vertical"></i>
              </button>
              <i :class="isFolderExpanded(element.id) ? 'fa-solid fa-folder-open' : 'fa-solid fa-folder'" class="item-icon folder-icon"></i>
              <span class="item-name">{{ (element as Folder).name }}</span>
              <span class="folder-count">{{ (element as Folder).children.length }}</span>
              <button class="add-btn" @click.stop="handleAddNoteToFolder(element.id)" title="Add note to folder">
                <i class="fa-solid fa-plus"></i>
              </button>
              <button class="delete-btn" @click.stop="confirmDelete(element)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>

            <Transition name="expand">
              <div v-show="isFolderExpanded(element.id)" class="folder-children" :class="{ 'has-items': (element as Folder).children.length > 0 }">
              <draggable
                :list="(element as Folder).children"
                group="notes"
                item-key="id"
                handle=".drag-handle"
                ghost-class="ghost"
                animation="200"
                @end="handleDragEnd"
                class="folder-children-list"
              >
                <template #item="{ element: child }">
                  <div
                    class="tree-item child-item"
                    :class="{ selected: child.id === notesStore.currentNoteId }"
                    @click="child.type === 'note' && handleSelect(child)"
                    @contextmenu="handleContextMenu($event, child)"
                  >
                    <button class="drag-handle" @click.stop>
                      <i class="fa-solid fa-grip-vertical"></i>
                    </button>
                    <i :class="child.type === 'folder' ? 'fa-solid fa-folder' : 'fa-solid fa-file-lines'" class="item-icon"></i>
                    <span class="item-name">{{ child.type === 'folder' ? child.name : child.title }}</span>
                    <div class="item-tags" v-if="child.type === 'note' && getNoteTag(child)">
                      <span
                        class="tag-dot"
                        :style="{ backgroundColor: notesStore.getTagColor(getNoteTag(child)!) }"
                      ></span>
                    </div>
                    <button v-if="child.type === 'note'" class="delete-btn" @click.stop="confirmDelete(child)">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </template>
              </draggable>

              <div v-if="(element as Folder).children.length === 0" class="folder-empty">
                <span>Drag notes here or click + to add</span>
              </div>
            </div>
            </Transition>
          </div>
        </div>
      </template>
    </draggable>

    <!-- Context Menu -->
    <Teleport to="body">
      <div
        v-if="showContextMenu && contextMenuItem?.type === 'note'"
        class="context-menu"
        :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      >
        <div class="context-header">
          <span class="context-title">{{ (contextMenuItem as Note).title }}</span>
        </div>
        <div class="context-divider"></div>
        <div class="context-section">
          <span class="context-label">Tag</span>
          <button
            v-for="tag in allTags"
            :key="tag.id"
            class="context-tag-btn"
            :class="{ active: getNoteTag(contextMenuItem as Note) === tag.id }"
            :style="{ borderColor: tag.color, color: getNoteTag(contextMenuItem as Note) === tag.id ? 'white' : tag.color, backgroundColor: getNoteTag(contextMenuItem as Note) === tag.id ? tag.color : 'transparent' }"
            @click="handleSetTag(tag.id)"
          >
            {{ tag.name }}
          </button>
          <span v-if="allTags.length === 0" class="context-empty">No tags available</span>
        </div>
        <div class="context-divider"></div>
        <!-- Export disabled temporarily
        <div class="context-section">
          <span class="context-label">Export</span>
          <button class="context-export-btn" @mousedown.stop="(e) => handleExportNote(e, 'md')">
            <i class="fa-solid fa-file-lines"></i> Markdown
          </button>
          <button class="context-export-btn" @mousedown.stop="(e) => handleExportNote(e, 'html')">
            <i class="fa-brands fa-html5"></i> HTML
          </button>
        </div>
        <div class="context-divider"></div>
        -->
        <button class="context-delete-btn" @click="confirmDelete(contextMenuItem!)">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>

      <!-- Folder Context Menu -->
      <div
        v-else-if="showContextMenu && contextMenuItem?.type === 'folder'"
        class="context-menu"
        :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      >
        <div class="context-header">
          <span class="context-title">{{ (contextMenuItem as Folder).name }}</span>
        </div>
        <div class="context-divider"></div>
        <!-- Export disabled temporarily
        <div class="context-section">
          <span class="context-label">Export</span>
          <button class="context-export-btn" @mousedown.stop="(e) => exportFolderAsZip(e, contextMenuItem as Folder)">
            <i class="fa-solid fa-file-zipper"></i> Export as ZIP
          </button>
        </div>
        <div class="context-divider"></div>
        -->
        <button class="context-delete-btn" @click="confirmDelete(contextMenuItem!)">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </Teleport>

    <!-- Delete Confirmation Dialog -->
    <Teleport to="body">
      <div v-if="showDeleteDialog" class="dialog-overlay" @click="cancelDelete">
        <div class="dialog glass" @click.stop>
          <div class="dialog-header">
            <i class="fa-solid fa-triangle-exclamation warning-icon"></i>
            <h3>Confirm Delete</h3>
          </div>
          <div class="dialog-body">
            <p v-if="itemToDelete?.type === 'note'">
              Are you sure you want to delete "<strong>{{ (itemToDelete as Note).title }}</strong>"?
            </p>
            <p v-else>
              Are you sure you want to delete the folder "<strong>{{ (itemToDelete as Folder).name }}</strong>" and all its contents?
            </p>
          </div>
          <div class="dialog-footer">
            <button class="btn btn-ghost" @click="cancelDelete">Cancel</button>
            <button class="btn btn-danger" @click="handleDelete">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.note-tree { height: 100%; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1.5rem; text-align: center; }
.empty-icon { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 16px; background: var(--glass-bg); margin-bottom: 1rem; }
.empty-icon i { font-size: 1.5rem; color: var(--text-tertiary); }
.empty-text { font-size: 0.9375rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.25rem; }
.empty-hint { font-size: 0.8125rem; color: var(--text-tertiary); }
.tree-list { display: flex; flex-direction: column; gap: 0.25rem; }
.tree-item-wrapper { animation: fadeIn 0.2s ease; }
.tree-item { display: flex; align-items: center; gap: 0.375rem; padding: 0.5rem 0.625rem; border-radius: 10px; cursor: pointer; transition: all 0.15s ease; }
.tree-item:hover { background: var(--bg-hover); }
.tree-item.selected { background: var(--accent-light); }
.tree-item.selected .item-name { color: var(--accent-color); font-weight: 500; }
.drag-handle { opacity: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--text-tertiary); cursor: grab; transition: opacity 0.15s; }
.tree-item:hover .drag-handle, .folder-header:hover .drag-handle { opacity: 1; }
.drag-handle:active { cursor: grabbing; }
.item-icon { font-size: 0.875rem; color: var(--text-tertiary); }
.tree-item.selected .item-icon { color: var(--accent-color); }
.folder-icon { color: var(--warning-color); }
.item-name { flex: 1; font-size: 0.875rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-tags { display: flex; gap: 0.25rem; }
.tag-dot { width: 8px; height: 8px; border-radius: 50%; }
.delete-btn, .add-btn { opacity: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 6px; background: transparent; color: var(--text-tertiary); cursor: pointer; transition: all 0.15s; font-size: 0.75rem; }
.tree-item:hover .delete-btn, .tree-item:hover .add-btn, .folder-header:hover .delete-btn, .folder-header:hover .add-btn { opacity: 1; }
.add-btn:hover { background: var(--accent-light); color: var(--accent-color); }
.delete-btn:hover { background: var(--danger-color); color: white; }
.folder-item { margin-bottom: 0.25rem; }
.folder-header { display: flex; align-items: center; gap: 0.375rem; padding: 0.5rem 0.625rem; border-radius: 10px; background: var(--bg-tertiary); cursor: pointer; user-select: none; }
.folder-header:hover { background: var(--bg-hover); }
.folder-header.selected { background: var(--accent-light); }
.folder-count { font-size: 0.6875rem; color: var(--text-tertiary); background: var(--bg-secondary); padding: 0.125rem 0.375rem; border-radius: 8px; margin-left: auto; }
.folder-children { margin-left: 0.75rem; padding-left: 0.75rem; border-left: 2px solid var(--border-color); margin-top: 0.25rem; overflow: hidden; }
.folder-children.has-items { padding-bottom: 0.25rem; }
.folder-children-list { min-height: 0.5rem; }

/* Folder expand/collapse animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.folder-empty { padding: 0.75rem; font-size: 0.75rem; color: var(--text-tertiary); text-align: center; font-style: italic; }
.child-item { margin-bottom: 0.125rem; }
.ghost { opacity: 0.4; background: var(--accent-light); border-radius: 10px; }

/* Context Menu */
.context-menu {
  position: fixed;
  min-width: 200px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 0.5rem;
  z-index: 1000;
}

.context-header { padding: 0.5rem; }
.context-title { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); }
.context-divider { height: 1px; background: var(--border-color); margin: 0.5rem 0; }
.context-section { padding: 0.5rem; }
.context-label { display: block; font-size: 0.6875rem; font-weight: 500; color: var(--text-tertiary); margin-bottom: 0.375rem; text-transform: uppercase; }
.context-tag-btn {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1.5px solid;
  border-radius: 6px;
  margin: 0.125rem;
  cursor: pointer;
  transition: all 0.15s;
}
.context-remove-btn {
  display: block;
  width: 100%;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  margin-top: 0.25rem;
}
.context-remove-btn:hover { background: var(--bg-hover); }
.context-empty { font-size: 0.75rem; color: var(--text-tertiary); font-style: italic; }
.context-delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  font-size: 0.8125rem;
  color: var(--danger-color);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.context-delete-btn:hover { background: rgba(239, 68, 68, 0.1); }

/* Dialog */
.dialog-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog { width: 360px; background: var(--bg-primary); padding: 1.5rem; border-radius: 16px; }
.dialog-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
.warning-icon { font-size: 1.5rem; color: var(--warning-color); }
.dialog-header h3 { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); }
.dialog-body { margin-bottom: 1.5rem; }
.dialog-body p { color: var(--text-secondary); line-height: 1.5; }
.dialog-body strong { color: var(--text-primary); }
.dialog-footer { display: flex; justify-content: flex-end; gap: 0.5rem; }
.btn-danger { background: var(--danger-color); color: white; }
.btn-danger:hover { opacity: 0.9; }
</style>
