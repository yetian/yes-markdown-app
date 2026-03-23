import MarkdownIt from 'markdown-it'
import highlightjs from 'highlight.js'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    const languageLabel = lang || 'text'
    // Trim leading and trailing empty lines
    const trimmedStr = str.replace(/^\n+|\n+$/g, '')
    let highlighted: string

    if (lang && highlightjs.getLanguage(lang)) {
      try {
        highlighted = highlightjs.highlight(trimmedStr, { language: lang, ignoreIllegals: true }).value
      } catch {
        highlighted = escapeHtml(trimmedStr)
      }
    } else {
      highlighted = escapeHtml(trimmedStr)
    }

    return `<div class="code-block-wrapper" data-lang="${languageLabel}">
      <div class="code-block-header">
        <span class="code-lang">${languageLabel}</span>
        <button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('.code-block-wrapper').querySelector('code').textContent).then(() => { this.innerHTML = '<i class=\\'fa-regular fa-check\\'></i>'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i>', 2000); })">
          <i class="fa-regular fa-copy"></i>
        </button>
      </div>
      <pre class="hljs"><code>${highlighted}</code></pre>
    </div>`
  }
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderLatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html'
    })
  } catch (e) {
    return `<span class="katex-error">${escapeHtml(latex)}</span>`
  }
}

export function renderMarkdown(content: string): string {
  let processed = content

  // Process mermaid code blocks first
  processed = processed.replace(
    /```mermaid\n([\s\S]*?)```/g,
    (_, code) => {
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      return `<div class="mermaid" id="${id}">${code.trim()}</div>`
    }
  )

  // Process display math ($$...$$) - must be before inline math
  processed = processed.replace(
    /\$\$([\s\S]+?)\$\$/g,
    (_, math) => {
      return renderLatex(math.trim(), true)
    }
  )

  // Process inline math ($...$) - avoid matching currency
  processed = processed.replace(
    /(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g,
    (_, math) => {
      return renderLatex(math.trim(), false)
    }
  )

  return md.render(processed)
}

export function initMermaid() {
  if (typeof window !== 'undefined') {
    import('mermaid').then((mermaid) => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      mermaid.default.initialize({
        startOnLoad: true,
        theme: isDark ? 'dark' : 'default',
        themeVariables: isDark ? {
          primaryColor: '#0a84ff',
          primaryTextColor: '#f5f5f7',
          primaryBorderColor: '#0a84ff',
          lineColor: '#636366',
          secondaryColor: '#1c1c1e',
          tertiaryColor: '#141414',
          background: '#0a0a0a',
          mainBkg: '#141414',
          nodeBorder: '#0a84ff',
          clusterBkg: '#1c1c1e',
          clusterBorder: '#636366',
          titleColor: '#f5f5f7',
          edgeLabelBackground: '#0a0a0a',
        } : undefined,
        flowchart: { useMaxWidth: true },
        sequence: { useMaxWidth: true },
        gantt: { useMaxWidth: true }
      })
      mermaid.default.run()
    })
  }
}

export default md
