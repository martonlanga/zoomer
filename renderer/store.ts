import path from 'path'
import { Terminal } from 'xterm'
import create from 'zustand'
import { Command } from '../electron-src/interfaces'
import resolveOutput from './lib/resolve-output'

const DEFAULT_PATH = '/Users/martonlanga/'

interface Store {
  history: Command[]
  add: (inputCommand: Omit<Command, 'out'>) => void
  clear: () => void
  termOutput: (data: string) => void
  currentDir: string
  setCurrentDir: (cd: string) => void
}

const [useStore] = create<Store>((set, get) => {
  const initialStore = {
    history: [],
    add: inputCommand => {
      const command = resolveOutput(inputCommand)

      set(() => ({
        history: [...get().history, command],
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
          const term = new Terminal()
          term.open(el)
          term.write(data)
          term.onKey(({ key }) => {
            if (key.charCodeAt(0) == 13) {
              term.write('\n')
            }
            term.write(key)
          })
          el.focus()
          last.term = term
        }
      }
      if (typeof last.out === 'undefined') {
        last.out = ''
      }
      last.out += data
      const newHistory = [...history.slice(0, history.length - 1), last]
      set({ history: newHistory })
    },
    clear: () => set({ history: [] }),
    currentDir: DEFAULT_PATH,
    setCurrentDir: cd =>
      set({ currentDir: path.resolve(get().currentDir, cd) }),
  } as Store
  return initialStore
})

export default useStore
