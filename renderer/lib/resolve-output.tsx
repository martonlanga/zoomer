import { PortalWithState } from 'react-portal'
import { Command } from '../../electron-src/interfaces'
import Edit from '../components/custom/edit'
import Ls from '../components/custom/ls'
import Iframe from '../components/custom/iframe'
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
      case 'edit':
        const path =
          inputCommand.currentDir + '/' + inputCommand.input.split(' ')[1]
        out = (
          <PortalWithState defaultOpen>
            {props => <Edit {...props} path={path} />}
          </PortalWithState>
        )
        break
      case 'iframe':
        out = <Iframe src={inputCommand.input.split(' ')[1]} />
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
