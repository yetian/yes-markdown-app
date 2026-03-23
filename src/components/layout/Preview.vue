<script setup lang="ts">
import { computed, watch, onMounted, nextTick, ref } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { renderMarkdown, initMermaid } from '@/utils/markdown'

const notesStore = useNotesStore()
const previewRef = ref<HTMLElement | null>(null)

const currentNote = computed(() => notesStore.currentNote)

const renderedContent = computed(() => {
  if (!currentNote.value) return ''
  return renderMarkdown(currentNote.value.content)
})

watch(renderedContent, async () => {
  await nextTick()
  initMermaid()
}, { flush: 'post' })

onMounted(() => {
  initMermaid()
})
</script>

<template>
  <div class="preview">
    <div class="preview-header">
      <h3><i class="fa-solid fa-eye"></i> Preview</h3>
    </div>

    <div class="preview-content" v-if="currentNote" ref="previewRef">
      <h1 class="preview-title">{{ currentNote.title }}</h1>
      <div class="markdown-body" v-html="renderedContent"></div>
    </div>

    <div class="preview-placeholder" v-else>
      <div class="placeholder-icon">
        <i class="fa-solid fa-eye"></i>
      </div>
      <p class="placeholder-text">Preview will appear here</p>
    </div>
  </div>
</template>

<style scoped>
.preview {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-header {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  min-height: 37px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.preview-header h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

.preview-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.preview-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  margin-bottom: 1.5rem;
}

.placeholder-icon i {
  font-size: 2rem;
  color: var(--text-tertiary);
}

.placeholder-text {
  font-size: 1rem;
  color: var(--text-tertiary);
}

/* Markdown Styles */
.markdown-body {
  line-height: 1.75;
  color: var(--text-primary);
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary);
}

.markdown-body :deep(h1:first-child),
.markdown-body :deep(h2:first-child),
.markdown-body :deep(h3:first-child) {
  margin-top: 0;
}

.markdown-body :deep(h1) { font-size: 1.75rem; }
.markdown-body :deep(h2) { font-size: 1.5rem; }
.markdown-body :deep(h3) { font-size: 1.25rem; }
.markdown-body :deep(h4) { font-size: 1.1rem; }

.markdown-body :deep(p) {
  margin-bottom: 1rem;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-body :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-body :deep(blockquote) {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border-left: 4px solid var(--accent-color);
  background: var(--bg-secondary);
  border-radius: 0 8px 8px 0;
  color: var(--text-secondary);
}

.markdown-body :deep(code) {
  background: var(--bg-tertiary);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.875em;
}

.markdown-body :deep(.code-block-wrapper) {
  margin: 1rem 0;
  border-radius: 12px;
  overflow: hidden;
  background: #f6f8fa;
  border: 1px solid var(--border-color);
  position: relative;
  padding-top: 1.75rem;
}

[data-theme="dark"] .markdown-body :deep(.code-block-wrapper) {
  background: #0d1117;
}

.markdown-body :deep(.code-block-header) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid var(--border-color);
}

[data-theme="dark"] .markdown-body :deep(.code-block-header) {
  background: rgba(255, 255, 255, 0.03);
}

.markdown-body :deep(.code-lang) {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: lowercase;
}

.markdown-body :deep(.copy-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.markdown-body :deep(.copy-btn:hover) {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.markdown-body :deep(pre) {
  margin: 0;
  padding: 0.625rem 0.75rem;
  border-radius: 0;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  background: transparent;
  padding: 0;
  font-size: 0.8125rem;
  letter-spacing: 0;
  line-height: 1.5;
}

/* Light mode code highlight - GitHub style */
.markdown-body :deep(.hljs) {
  color: #24292e;
}

.markdown-body :deep(.hljs-keyword),
.markdown-body :deep(.hljs-selector-tag),
.markdown-body :deep(.hljs-title),
.markdown-body :deep(.hljs-section),
.markdown-body :deep(.hljs-doctag),
.markdown-body :deep(.hljs-name),
.markdown-body :deep(.hljs-strong) {
  color: #d73a49;
  font-weight: bold;
}

.markdown-body :deep(.hljs-string),
.markdown-body :deep(.hljs-title.class_),
.markdown-body :deep(.hljs-title.class_.inherited__),
.markdown-body :deep(.hljs-title.function_),
.markdown-body :deep(.hljs-attr),
.markdown-body :deep(.hljs-symbol),
.markdown-body :deep(.hljs-bullet),
.markdown-body :deep(.hljs-addition),
.markdown-body :deep(.hljs-template-tag),
.markdown-body :deep(.hljs-template-variable) {
  color: #032f62;
}

.markdown-body :deep(.hljs-comment),
.markdown-body :deep(.hljs-quote) {
  color: #6a737d;
  font-style: italic;
}

.markdown-body :deep(.hljs-number),
.markdown-body :deep(.hljs-literal),
.markdown-body :deep(.hljs-type),
.markdown-body :deep(.hljs-params),
.markdown-body :deep(.hljs-link) {
  color: #005cc5;
}

.markdown-body :deep(.hljs-built_in),
.markdown-body :deep(.hljs-builtin-name) {
  color: #e36209;
}

.markdown-body :deep(.hljs-deletion) {
  color: #b31d28;
  background: #ffeef0;
}

.markdown-body :deep(.hljs-meta) {
  color: #005cc5;
}

/* Dark mode code highlight */
[data-theme="dark"] .markdown-body :deep(.hljs) {
  color: #c9d1d9;
}

[data-theme="dark"] .markdown-body :deep(.hljs-keyword),
[data-theme="dark"] .markdown-body :deep(.hljs-selector-tag),
[data-theme="dark"] .markdown-body :deep(.hljs-title),
[data-theme="dark"] .markdown-body :deep(.hljs-section),
[data-theme="dark"] .markdown-body :deep(.hljs-doctag),
[data-theme="dark"] .markdown-body :deep(.hljs-name) {
  color: #ff7b72;
}

[data-theme="dark"] .markdown-body :deep(.hljs-string),
[data-theme="dark"] .markdown-body :deep(.hljs-title.function_),
[data-theme="dark"] .markdown-body :deep(.hljs-attr) {
  color: #a5d6ff;
}

[data-theme="dark"] .markdown-body :deep(.hljs-comment),
[data-theme="dark"] .markdown-body :deep(.hljs-quote) {
  color: #8b949e;
}

[data-theme="dark"] .markdown-body :deep(.hljs-number),
[data-theme="dark"] .markdown-body :deep(.hljs-literal) {
  color: #79c0ff;
}

[data-theme="dark"] .markdown-body :deep(.hljs-built_in),
[data-theme="dark"] .markdown-body :deep(.hljs-builtin-name) {
  color: #ffa657;
}

.markdown-body :deep(a) {
  color: var(--accent-color);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 1rem 0;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.markdown-body :deep(th) {
  background: var(--bg-tertiary);
  font-weight: 600;
}

.markdown-body :deep(hr) {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  margin: 2rem 0;
}

/* Mermaid */
.markdown-body :deep(.mermaid) {
  margin: 1.5rem 0;
  text-align: center;
  display: flex;
  justify-content: center;
}

/* KaTeX */
.markdown-body :deep(.katex) {
  font-size: 1.1em;
}

.markdown-body :deep(.katex-display) {
  margin: 1.5rem 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.markdown-body :deep(.katex-error) {
  color: var(--danger-color);
  font-family: monospace;
}
</style>
