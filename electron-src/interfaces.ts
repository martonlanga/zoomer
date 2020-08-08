import { Terminal } from 'xterm'
export interface Command {
  id: string
  type: 'fallback' | 'custom'
  input: string
  currentDir: string
  out: any | undefined
  term?: Terminal
}

export type InputCommand = Omit<Command, 'out'>

export type CUSTOM_COMMAND = 'ls' | 'edit' | 'iframe'

export interface FileEntry {
  name: string
  path: string
  isDir: boolean
}
