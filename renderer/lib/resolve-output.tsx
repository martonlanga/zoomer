import { Command } from '../../electron-src/interfaces'
import Ls from '../components/custom/ls'
import ipc from './ipc'

const resolveOutput = (inputCommand: Omit<Command, 'out'>): Command => {
  let out = undefined
  if (inputCommand.type === 'custom') {
    // sync

    out = 'custom'
    const command = inputCommand.input.split(' ')[0]

    switch (command) {
      case 'ls':
        out = <Ls currentDir={inputCommand.currentDir} />
        break
      default:
        out = 'No custom component found for ' + command
    }
  } else {
    // async

    /**
     * Listen for it in terminal/index.tsx
     */

    ipc.send('pty', inputCommand)
  }
  return { ...inputCommand, out } as Command
}

export default resolveOutput
