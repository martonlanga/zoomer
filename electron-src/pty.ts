import { spawn as npSpawn } from 'node-pty'
import defaultShell from 'default-shell'

const defaultShellArgs = ['--login']

const createPty = (cwd = process.env.HOME) => {
  let spawn: typeof npSpawn
  try {
    spawn = require('node-pty').spawn
  } catch (err) {
    console.error(
      '`node-pty` failed to load. Typically this means that it was built incorrectly. Please check the `readme.md` to more info.',
    )
  }

  var ptyProcess = spawn(defaultShell, defaultShellArgs, {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: cwd,
    env: process.env as NodeJS.ProcessEnv,
  })
  return ptyProcess
}

export default createPty
