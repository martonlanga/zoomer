import { BrowserWindow } from 'electron'
import isDev from 'electron-is-dev'
import { join } from 'path'
import { format } from 'url'

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    center: true,
    maximizable: false,
    minimizable: false,
    show: false,
    acceptFirstMouse: true,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
      backgroundThrottling: false,
      spellcheck: false,
    },
  })

  const url = isDev
    ? 'http://localhost:8000/terminal'
    : format({
        pathname: join(__dirname, '../renderer/out/terminal.html'),
        protocol: 'file:',
        slashes: true,
      })

  window.loadURL(url)

  if (isDev) {
    window.webContents.openDevTools()
  }

  window.on('ready-to-show', () => {
    window.show()
  })

  return window
}

export default createWindow
