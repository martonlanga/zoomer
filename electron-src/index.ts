import * as fsScandir from '@nodelib/fs.scandir'
import fs from 'fs'
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
import langDetector from 'language-detect'
import langMapper from 'language-map'

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

ipcMain.on('readFile', (event: IpcMainEvent, path: string) => {
  try {
    const content = fs.readFileSync(path, { encoding: 'utf-8' })

    event.returnValue = content
  } catch (e) {
    event.returnValue = null
  }
})

ipcMain.on(
  'writeFile',
  (event: IpcMainEvent, path: string, content: string) => {
    console.log('writing', path, content)

    fs.writeFileSync(path, content)
  },
)

ipcMain.on('getLanguage', (event: IpcMainEvent, path: string) => {
  try {
    event.returnValue = langMapper[langDetector.sync(path)].aceMode
  } catch (e) {
    event.returnValue = undefined
  }
})
