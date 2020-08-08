import * as fsScandir from '@nodelib/fs.scandir'
import { exec } from 'child_process'
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  IpcMainEvent,
} from 'electron'
import prepareNext from 'electron-next'
import createWindow from './create-window'
import { Command, FileEntry, InputCommand } from './interfaces'
import createPty from './pty'

let terminalWindow: BrowserWindow | null = null

app.allowRendererProcessReuse = false

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer')

  terminalWindow = createWindow()
})

// Quit the app once all windows are closed
app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') app.quit()
})

const pty = createPty()
pty.onData(function (data) {
  if (terminalWindow) {
    terminalWindow.webContents.send('data', data)
  }
})

ipcMain.on('pty', (event: IpcMainEvent, inputCommand: InputCommand) => {
  console.log('pty', inputCommand)
  pty.write(`${inputCommand.input}\r`)
})

ipcMain.on('getCommands', (event: IpcMainEvent, message: Command) => {
  exec(`compgen -A function -abck`, (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`)
      return
    }
    event.returnValue = stdout
  })
})

ipcMain.on('ls', (event: IpcMainEvent, currentDir: string) => {
  const files: FileEntry[] = fsScandir
    .scandirSync(currentDir, { stats: true })
    .map(file => ({
      name: file.name,
      path: file.path,
      isDir: file.dirent.isDirectory(),
    }))

  event.returnValue = files
})
