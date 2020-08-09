import { PortalWithState } from 'react-portal'
import { Command } from '../../electron-src/interfaces'
import Edit from '../components/custom/edit'
import Ls from '../components/custom/ls'
import Iframe from '../components/custom/iframe'
import ipc from './ipc'
import { getFiles } from '.'
import Table from '../components/custom/table'

const resolveOutput = (inputCommand: Omit<Command, 'out'>): Command => {
  const { type, input, currentDir } = inputCommand
  let out = undefined
  if (type === 'custom') {
    // sync

    out = 'custom'
    const command = input.split(' ')[0]

    switch (command) {
      case 'cd':
        out = null
        break
      case 'ls':
        if (input.includes('--json')) {
          const commands = input.split(' | ')
          if (commands.length > 1 && commands[1].split(' ')[0] === 'table') {
            // pipe (only table supported for now)
            out = <Table json={getFiles(currentDir)} />
          } else {
            out = <pre>{JSON.stringify(getFiles(currentDir), null, 2)}</pre>
          }
        } else {
          out = <Ls currentDir={currentDir} />
        }
        break
      case 'edit':
        const path = currentDir + '/' + input.split(' ')[1]
        out = (
          <PortalWithState defaultOpen>
            {props => <Edit {...props} path={path} />}
          </PortalWithState>
        )
        break
      case 'iframe':
        out = <Iframe src={input.split(' ')[1]} />
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
