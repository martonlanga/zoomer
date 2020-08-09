import * as fsScandir from '@nodelib/fs.scandir'
import { exec } from 'child_process'
import branchName from 'current-git-branch'
import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import prepareNext from 'electron-next'
import fs from 'fs'
import langDetector from 'language-detect'
import langMapper from 'language-map'
import path from 'path'
import createWindow from './create-window'
import { Command, CurrentDirStat, FileEntry, InputCommand } from './interfaces'
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

ipcMain.on('pty', (event: IpcMainEvent, inputCommand: InputCommand) => {
  console.log('pty', inputCommand)
  const pty = createPty(inputCommand.currentDir)
  pty.onData(function (data) {
    if (terminalWindow) {
      terminalWindow.webContents.send('data', data)
    }
  })
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

ipcMain.on('getCurrentDirStat', (event: IpcMainEvent, currentDir: string) => {
  try {
    const branch = branchName({ altPath: currentDir })
    event.returnValue = {
      isDir: fs.lstatSync(currentDir).isDirectory(),
      name: path.basename(currentDir),
      path: currentDir,
      gitBranch: branch ? branch : undefined,
    } as CurrentDirStat
  } catch (e) {
    event.returnValue = null
  }
})
