import { FileEntry } from './../../electron-src/interfaces'
import ipc from './ipc'

export const getFiles = (dir: string): FileEntry[] => {
  return ipc.sendSync('ls', dir)
}

export const readFile = (path: string): string | null => {
  return ipc.sendSync('readFile', path)
}

export const writeFile = (path: string, content: string) => {
  ipc.send('writeFile', path, content)
}

export const getLanguage = (path: string): string | undefined => {
  return ipc.sendSync('getLanguage', path)
}
