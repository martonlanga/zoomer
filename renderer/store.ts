import { Terminal } from 'xterm'
import create from 'zustand'
import { Command } from '../electron-src/interfaces'
import resolveOutput from './lib/resolve-output'

interface Store {
  history: Command[]
  add: (inputCommand: Omit<Command, 'out'>) => void
  clear: () => void
  termOutput: (data: string) => void
}

const [useStore] = create<Store>((set, get) => {
  const initialStore = {
    history: [],
    add: inputCommand => {
      const command = resolveOutput(inputCommand)
      set(({ history }) => ({
        history: history ? [...history, command] : [command],
      }))
    },
    termOutput: data => {
      const { history } = get()
      const last = { ...history[history.length - 1] }
      if (last.term) {
        last.term.write(data)
      } else {
        const el = document.querySelector(`#term-${last.id}`) as HTMLElement
        if (el) {
          last.term = new Terminal()
          last.term.open(el)
          last.term.write(data)
        }
      }
      if (typeof last.out === 'undefined') {
        last.out = ''
      }
      last.out += data
      const newHistory = [...history.slice(0, history.length - 2), last]
      set({ history: newHistory })
    },
    clear: () => set({ history: [] }),
  } as Store
  return initialStore
})

export default useStore