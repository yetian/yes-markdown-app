import type { Note, Folder, TreeItem } from '@/types'

export interface ExportOptions {
  format: 'md' | 'html' | 'json'
  includeFolderStructure: boolean
}

function noteToMarkdown(note: Note): string {
  return `# ${note.title}\n\n${note.content}`
}

function noteToHtml(note: Note, content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${note.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    code { background: #f5f5f5; padding: 0.125rem 0.375rem; border-radius: 0.25rem; }
    blockquote { border-left: 4px solid #3B82F6; padding-left: 1rem; color: #666; }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  ${content}
</body>
</html>`
}

export function exportNote(note: Note, format: 'md' | 'html', renderedContent?: string): void {
  let content: string
  let filename: string
  let mimeType: string

  switch (format) {
    case 'md':
      content = noteToMarkdown(note)
      filename = `${note.title}.md`
      mimeType = 'text/markdown'
      break
    case 'html':
      content = noteToHtml(note, renderedContent || note.content)
      filename = `${note.title}.html`
      mimeType = 'text/html'
      break
    default:
      content = noteToMarkdown(note)
      filename = `${note.title}.md`
      mimeType = 'text/markdown'
  }

  downloadFile(content, filename, mimeType)
}

export function exportAllNotes(
  items: TreeItem[],
  format: 'md' | 'html' | 'json',
  includeFolderStructure: boolean = true,
  renderMarkdown?: (content: string) => string
): void {
  const notes: Array<{ note: Note; path: string[] }> = []
  const folders: Array<{ folder: Folder; path: string[] }> = []

  function collectItems(items: TreeItem[], currentPath: string[] = []) {
    for (const item of items) {
      if (item.type === 'note') {
        notes.push({ note: item, path: currentPath })
      } else {
        folders.push({ folder: item, path: currentPath })
        collectItems(item.children, [...currentPath, item.name])
      }
    }
  }

  collectItems(items)

  if (format === 'json') {
    const data = {
      notes: notes.map(({ note, path }) => ({
        ...note,
        folderPath: path.join('/')
      })),
      folders: folders.map(({ folder, path }) => ({
        id: folder.id,
        name: folder.name,
        path: path.join('/')
      })),
      exportedAt: new Date().toISOString()
    }
    downloadFile(JSON.stringify(data, null, 2), 'notes-export.json', 'application/json')
    return
  }

  // For md/html, create a zip-like structure or individual files
  // For simplicity, we'll export as a single combined file
  let combinedContent = ''

  for (const { note, path } of notes) {
    const prefix = includeFolderStructure && path.length > 0 ? `${path.join(' > ')}: ` : ''
    combinedContent += `\n\n---\n\n${prefix}# ${note.title}\n\n`

    if (format === 'html' && renderMarkdown) {
      combinedContent += renderMarkdown(note.content)
    } else {
      combinedContent += note.content
    }
  }

  const filename = format === 'html' ? 'all-notes.html' : 'all-notes.md'
  const mimeType = format === 'html' ? 'text/html' : 'text/markdown'

  if (format === 'html') {
    combinedContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>All Notes Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    code { background: #f5f5f5; padding: 0.125rem 0.375rem; border-radius: 0.25rem; }
    blockquote { border-left: 4px solid #3B82F6; padding-left: 1rem; color: #666; }
    hr { border: none; border-top: 2px solid #eee; margin: 2rem 0; }
  </style>
</head>
<body>
${combinedContent}
</body>
</html>`
  }

  downloadFile(combinedContent, filename, mimeType)
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
