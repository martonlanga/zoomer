import { FileEntry } from './../../electron-src/interfaces'
import ipc from './ipc'

export const getFiles = (dir: string): FileEntry[] => {
  return ipc.sendSync('ls', dir)
}
