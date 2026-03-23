export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: number
  updatedAt: number
  type: 'note'
}

export interface Folder {
  id: string
  name: string
  children: (Folder | Note)[]
  createdAt: number
  updatedAt: number
  type: 'folder'
}

export interface Tag {
  id: string
  name: string
  color: string
}

export type TreeItem = Note | Folder

export interface AppState {
  rootItems: TreeItem[]
  tags: Tag[]
  currentNoteId: string | null
}
