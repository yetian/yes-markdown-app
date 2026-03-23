import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Locale = 'zh' | 'en' | 'de'

export interface LocaleOption {
  code: Locale
  name: string
  nativeName: string
  flag: string
}

export const localeOptions: LocaleOption[] = [
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
]

const translations = {
  zh: {
    // App
    appTitle: 'Yes Markdown',

    // Activity Bar
    files: '文件',
    tags: '标签',
    settings: '设置',

    // Sidebar
    newNote: '新建笔记',
    folder: '文件夹',
    searchPlaceholder: '搜索笔记...',
    noNotes: '暂无笔记',
    noNotesHint: '创建你的第一个笔记',

    // Editor
    untitled: '无标题',
    selectNoteHint: '选择一个笔记开始写作',
    orCreateNew: '或从侧边栏新建',

    // Toolbar
    bold: '粗体',
    italic: '斜体',
    code: '代码',
    strikethrough: '删除线',
    heading: '标题',
    list: '列表',
    quote: '引用',
    link: '链接',
    image: '图片',

    // Preview
    preview: '预览',
    previewHint: '预览将在此显示',

    // Tag Sidebar
    noTags: '暂无标签',
    createFirstTag: '创建你的第一个标签',

    // Settings
    theme: '主题',
    sidebarWidth: '侧边栏宽度',
    language: '语言',
    light: '浅色',
    dark: '深色',

    // Export
    export: '导出',
    exportCurrentMd: '导出当前为 Markdown',
    exportCurrentHtml: '导出当前为 HTML',
    exportAllMd: '导出全部为 Markdown',
    exportAllHtml: '导出全部为 HTML',
    exportAllJson: '导出全部为 JSON',

    // Dialogs
    confirmDelete: '确认删除',
    deleteNoteMsg: '确定要删除 "**" 吗？',
    deleteFolderMsg: '确定要删除文件夹 "**" 及其所有内容吗？',
    cancel: '取消',
    delete: '删除',

    // Context Menu
    removeTag: '移除标签',
    noTagsAvailable: '暂无可用标签',

    // Folder
    dragToFolder: '拖拽笔记到这里或点击 + 添加',
  },
  en: {
    // App
    appTitle: 'Yes Markdown',

    // Activity Bar
    files: 'Files',
    tags: 'Tags',
    settings: 'Settings',

    // Sidebar
    newNote: 'New Note',
    folder: 'Folder',
    searchPlaceholder: 'Search notes...',
    noNotes: 'No notes yet',
    noNotesHint: 'Create your first note to get started',

    // Editor
    untitled: 'Untitled',
    selectNoteHint: 'Select a note to start writing',
    orCreateNew: 'Or create a new one from the sidebar',

    // Toolbar
    bold: 'Bold',
    italic: 'Italic',
    code: 'Code',
    strikethrough: 'Strikethrough',
    heading: 'Heading',
    list: 'List',
    quote: 'Quote',
    link: 'Link',
    image: 'Image',

    // Preview
    preview: 'Preview',
    previewHint: 'Preview will appear here',

    // Tag Sidebar
    noTags: 'No tags yet',
    createFirstTag: 'Create your first tag',

    // Settings
    theme: 'Theme',
    sidebarWidth: 'Sidebar Width',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',

    // Export
    export: 'Export',
    exportCurrentMd: 'Export Current as Markdown',
    exportCurrentHtml: 'Export Current as HTML',
    exportAllMd: 'Export All as Markdown',
    exportAllHtml: 'Export All as HTML',
    exportAllJson: 'Export All as JSON',

    // Dialogs
    confirmDelete: 'Confirm Delete',
    deleteNoteMsg: 'Are you sure you want to delete "**"?',
    deleteFolderMsg: 'Are you sure you want to delete the folder "**" and all its contents?',
    cancel: 'Cancel',
    delete: 'Delete',

    // Context Menu
    removeTag: 'Remove Tag',
    noTagsAvailable: 'No tags available',

    // Folder
    dragToFolder: 'Drag notes here or click + to add',
  },
  de: {
    // App
    appTitle: 'Yes Markdown',

    // Activity Bar
    files: 'Dateien',
    tags: 'Tags',
    settings: 'Einstellungen',

    // Sidebar
    newNote: 'Neue Notiz',
    folder: 'Ordner',
    searchPlaceholder: 'Notizen suchen...',
    noNotes: 'Noch keine Notizen',
    noNotesHint: 'Erstelle deine erste Notiz',

    // Editor
    untitled: 'Unbenannt',
    selectNoteHint: 'Wähle eine Notiz zum Schreiben',
    orCreateNew: 'Oder erstelle eine neue in der Seitenleiste',

    // Toolbar
    bold: 'Fett',
    italic: 'Kursiv',
    code: 'Code',
    strikethrough: 'Durchgestrichen',
    heading: 'Überschrift',
    list: 'Liste',
    quote: 'Zitat',
    link: 'Link',
    image: 'Bild',

    // Preview
    preview: 'Vorschau',
    previewHint: 'Vorschau wird hier angezeigt',

    // Tag Sidebar
    noTags: 'Noch keine Tags',
    createFirstTag: 'Erstelle deinen ersten Tag',

    // Settings
    theme: 'Design',
    sidebarWidth: 'Seitenleistenbreite',
    language: 'Sprache',
    light: 'Hell',
    dark: 'Dunkel',

    // Export
    export: 'Exportieren',
    exportCurrentMd: 'Aktuelle als Markdown exportieren',
    exportCurrentHtml: 'Aktuelle als HTML exportieren',
    exportAllMd: 'Alle als Markdown exportieren',
    exportAllHtml: 'Alle als HTML exportieren',
    exportAllJson: 'Alle als JSON exportieren',

    // Dialogs
    confirmDelete: 'Löschen bestätigen',
    deleteNoteMsg: 'Möchtest du "**" wirklich löschen?',
    deleteFolderMsg: 'Möchtest du den Ordner "**" und seinen gesamten Inhalt wirklich löschen?',
    cancel: 'Abbrechen',
    delete: 'Löschen',

    // Context Menu
    removeTag: 'Tag entfernen',
    noTagsAvailable: 'Keine Tags verfügbar',

    // Folder
    dragToFolder: 'Notizen hierher ziehen oder + klicken zum Hinzufügen',
  },
}

type TranslationKey = keyof typeof translations.en

function getInitialLocale(): Locale {
  const stored = localStorage.getItem('locale')
  if (stored === 'zh' || stored === 'en' || stored === 'de') {
    return stored
  }
  const browserLang = navigator.language.split('-')[0]
  if (browserLang === 'zh' || browserLang === 'de') {
    return browserLang as Locale
  }
  return 'en'
}

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref<Locale>(getInitialLocale())

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    let text = translations[locale.value][key] || translations.en[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace('**', v)
      })
    }
    return text
  }

  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
  }

  return {
    locale,
    t,
    setLocale
  }
})
