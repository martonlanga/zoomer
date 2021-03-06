import { Suggestion } from './../../electron-src/parse-man-pages'
import { FileEntry, CurrentDirStat } from './../../electron-src/interfaces'
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

export const getCommands = (): string[] => {
  const cmds = ipc.sendSync('getCommands')
  return cmds.split(/\s+/)
}

export const getCurrentDirStat = (currentDir: string): CurrentDirStat => {
  return ipc.sendSync('getCurrentDirStat', currentDir)
}

export const getParsedManPage = (cmd: string): Suggestion[] => {
  const parsedManPage = ipc.sendSync('getParsedManPage', cmd)
  return parsedManPage ? parsedManPage : []
}
