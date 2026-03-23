<script setup lang="ts">
import { ref, computed, watch, onMounted, shallowRef, onUnmounted } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useThemeStore } from '@/stores/theme'
import { EditorState, Compartment } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const notesStore = useNotesStore()
const themeStore = useThemeStore()
const editorContainer = ref<HTMLElement | null>(null)
const editorView = shallowRef<EditorView | null>(null)
const themeCompartment = new Compartment()

const currentNote = computed(() => notesStore.currentNote)

const toolbarItems = [
  { icon: 'fa-solid fa-bold', title: 'Bold (Ctrl+B)', action: () => insertMarkdown('**', '**') },
  { icon: 'fa-solid fa-italic', title: 'Italic (Ctrl+I)', action: () => insertMarkdown('*', '*') },
  { icon: 'fa-solid fa-code', title: 'Code', action: () => insertMarkdown('`', '`') },
  { icon: 'fa-solid fa-strikethrough', title: 'Strikethrough', action: () => insertMarkdown('~~', '~~') },
  { divider: true },
  { icon: 'fa-solid fa-heading', title: 'Heading', action: () => insertMarkdown('## ', '') },
  { icon: 'fa-solid fa-list-ul', title: 'List', action: () => insertMarkdown('- ', '') },
  { icon: 'fa-solid fa-quote-right', title: 'Quote', action: () => insertMarkdown('> ', '') },
  { icon: 'fa-solid fa-link', title: 'Link', action: () => insertMarkdown('[', '](url)') },
  { icon: 'fa-solid fa-image', title: 'Image', action: () => insertMarkdown('![', '](url)') },
]

function insertMarkdown(before: string, after: string) {
  if (!editorView.value) return
  const { from, to } = editorView.value.state.selection.main
  const selectedText = editorView.value.state.doc.sliceString(from, to)
  editorView.value.dispatch({
    changes: { from, to, insert: before + selectedText + after }
  })
  const newPos = from + before.length + selectedText.length
  editorView.value.dispatch({ selection: { anchor: newPos } })
  editorView.value.focus()
}

// Dynamic theme based on current mode
function getEditorTheme() {
  const isDark = themeStore.mode === 'dark'
  return EditorView.theme({
    '&': { height: '100%', backgroundColor: 'transparent' },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
      color: isDark ? '#e5e5e5' : '#1a1a1a'
    },
    '.cm-content': {
      padding: '16px 0',
      caretColor: isDark ? '#58a6ff' : '#0066ff'
    },
    '.cm-line': {
      padding: '0 20px',
      color: isDark ? '#e5e5e5' : '#1a1a1a'
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      border: 'none',
      color: isDark ? '#6e7681' : '#999'
    },
    '.cm-activeLineGutter': {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5'
    },
    '.cm-activeLine': {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
      zIndex: 0
    },
    '.cm-selectionBackground': {
      backgroundColor: isDark ? 'rgba(56,139,253,0.3) !important' : 'rgba(0,102,255,0.2) !important',
      zIndex: 1
    },
    '.cm-content > .cm-line': {
      zIndex: 0
    },
    '.cm-cursor': {
      borderLeftColor: isDark ? '#58a6ff' : '#0066ff'
    },
    '&.cm-focused .cm-selectionBackground': {
      backgroundColor: isDark ? 'rgba(56,139,253,0.25) !important' : 'rgba(0,102,255,0.15) !important'
    },
    // Markdown syntax highlighting colors
    '.cm-header': { color: isDark ? '#58a6ff' : '#0066ff', fontWeight: 'bold' },
    '.cm-header-1': { color: isDark ? '#58a6ff' : '#0066ff', fontWeight: 'bold', fontSize: '1.4em' },
    '.cm-header-2': { color: isDark ? '#58a6ff' : '#0066ff', fontWeight: 'bold', fontSize: '1.25em' },
    '.cm-header-3': { color: isDark ? '#58a6ff' : '#0066ff', fontWeight: 'bold', fontSize: '1.1em' },
    '.cm-strong': { fontWeight: 'bold' },
    '.cm-emphasis': { fontStyle: 'italic' },
    '.cm-strikethrough': { textDecoration: 'line-through', color: isDark ? '#8b949e' : '#888' },
    '.cm-link': { color: isDark ? '#58a6ff' : '#0066ff', textDecoration: 'underline' },
    '.cm-url': { color: isDark ? '#58a6ff' : '#0066ff' },
    '.cm-quote': { color: isDark ? '#8b949e' : '#666', fontStyle: 'italic' },
    '.cm-list': { color: isDark ? '#58a6ff' : '#0066ff' },
    '.cm-meta': { color: isDark ? '#8b949e' : '#888' },
    '.cm-comment': { color: isDark ? '#8b949e' : '#888' },
    '.cm-monospace': {
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0',
      borderRadius: '3px',
      padding: '0 2px'
    },
  }, { dark: isDark })
}

// Markdown syntax highlight style
const markdownHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontWeight: 'bold', fontSize: '1.4em', color: '#0066ff' },
  { tag: tags.heading2, fontWeight: 'bold', fontSize: '1.25em', color: '#0066ff' },
  { tag: tags.heading3, fontWeight: 'bold', fontSize: '1.1em', color: '#0066ff' },
  { tag: tags.heading4, fontWeight: 'bold', color: '#0066ff' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, color: '#0066ff', textDecoration: 'underline' },
  { tag: tags.url, color: '#0066ff' },
  // Don't override code - let language-data handle syntax highlighting
  { tag: tags.quote, color: '#666', fontStyle: 'italic' },
  { tag: tags.list, color: '#0066ff' },
  { tag: tags.meta, color: '#888' },
  // Mermaid diagram keywords
  { tag: tags.keyword, color: '#e36209' },
  { tag: tags.function(tags.variableName), color: '#6f42c1' },
  { tag: tags.typeName, color: '#005cc5' },
])

function createEditor() {
  if (!editorContainer.value) return
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged && currentNote.value) {
      notesStore.updateNoteContent(currentNote.value.id, update.state.doc.toString())
    }
  })

  const state = EditorState.create({
    doc: currentNote.value?.content || '',
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      dropCursor(),
      drawSelection(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      syntaxHighlighting(markdownHighlightStyle),
      themeCompartment.of(getEditorTheme()),
      updateListener,
    ]
  })

  editorView.value = new EditorView({ state, parent: editorContainer.value })
}

function destroyEditor() {
  if (editorView.value) {
    editorView.value.destroy()
    editorView.value = null
  }
}

function updateTheme() {
  if (editorView.value) {
    editorView.value.dispatch({
      effects: themeCompartment.reconfigure(getEditorTheme())
    })
  }
}

watch(() => themeStore.mode, updateTheme)
watch(currentNote, (newNote, oldNote) => {
  if (newNote?.id !== oldNote?.id) {
    destroyEditor()
    if (newNote) setTimeout(createEditor, 0)
  } else if (newNote && editorView.value) {
    const content = editorView.value.state.doc.toString()
    if (content !== newNote.content) {
      editorView.value.dispatch({
        changes: { from: 0, to: editorView.value.state.doc.length, insert: newNote.content }
      })
    }
  }
})

onMounted(() => { if (currentNote.value) createEditor() })
onUnmounted(destroyEditor)
</script>

<template>
  <div class="editor">
    <div class="editor-header" v-if="currentNote">
      <input
        v-model="currentNote.title"
        class="note-title"
        placeholder="Untitled"
        @input="notesStore.updateNoteTitle(currentNote.id, currentNote.title)"
      />
    </div>
    <div class="editor-toolbar" v-if="currentNote">
      <template v-for="(item, index) in toolbarItems" :key="index">
        <button v-if="!item.divider" class="toolbar-btn" :title="item.title" @click="item.action">
          <i :class="item.icon"></i>
        </button>
        <div v-else class="toolbar-divider"></div>
      </template>
    </div>
    <div class="editor-content" v-if="currentNote">
      <div ref="editorContainer" class="codemirror-container"></div>
    </div>
    <div class="editor-placeholder" v-if="!currentNote">
      <div class="placeholder-icon"><i class="fa-solid fa-file-lines"></i></div>
      <p class="placeholder-text">Select a note to start writing</p>
      <p class="placeholder-hint">Or create a new note from the sidebar</p>
    </div>
  </div>
</template>

<style scoped>
.editor { display: flex; flex-direction: column; height: 100%; }
.editor-header { padding: 0.5rem 1rem; border-bottom: 1px solid var(--border-color); min-height: 36px; box-sizing: border-box; display: flex; align-items: center; }
.note-title {
  width: 100%; border: none; font-size: 1.125rem; font-weight: 600;
  background: transparent; color: var(--text-primary); outline: none;
}
.note-title::placeholder { color: var(--text-tertiary); }
.editor-toolbar { display: flex; align-items: center; gap: 0.125rem; padding: 0.375rem 0.5rem; border-bottom: 1px solid var(--border-color); }
.toolbar-btn {
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 6px; background: transparent; color: var(--text-secondary);
  cursor: pointer; transition: all 0.15s ease; font-size: 0.75rem;
}
.toolbar-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.toolbar-divider { width: 1px; height: 20px; background: var(--border-color); margin: 0 0.375rem; }
.editor-content { flex: 1; overflow: hidden; }
.codemirror-container { height: 100%; }
.editor-placeholder {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem;
}
.placeholder-icon {
  width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;
  border-radius: 20px; background: var(--glass-bg); backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); margin-bottom: 1.5rem;
}
.placeholder-icon i { font-size: 2rem; color: var(--text-tertiary); }
.placeholder-text { font-size: 1.125rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
.placeholder-hint { font-size: 0.875rem; color: var(--text-tertiary); }
</style>
