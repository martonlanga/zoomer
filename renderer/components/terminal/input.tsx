import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Portal } from 'react-portal'
import { useKey } from 'react-use'
import { createEditor, Editor, Node, Range, Text, Transforms } from 'slate'
import {
  Editable,
  ReactEditor,
  Slate,
  withReact,
  useSelected,
  useFocused,
  RenderElementProps,
} from 'slate-react'
import { v4 as uuidv4 } from 'uuid'
import { CUSTOM_COMMAND } from '../../../electron-src/interfaces'
import useStore from '../../store'
import { getCommands } from '../../lib'
import { withHistory } from 'slate-history'
import PLUGINS from '../../lib/plugins'

export const getInput = (): HTMLDivElement | null => {
  const input = document.querySelector<HTMLDivElement>('#input')
  if (input && input.children[0]) {
    return input.childNodes[0] as HTMLDivElement
  }
  return null
}

const PLUGIN_NAMES = PLUGINS.map(({ name }) => name)

const CUSTOM_COMMANDS: CUSTOM_COMMAND[] = ['ls', 'edit', 'iframe']

const COMMANDS = [...getCommands(), ...CUSTOM_COMMANDS, ...PLUGIN_NAMES]

interface Props {
  currentDir: string
  setCurrentDir: (newDir: string) => void
}

const Input = ({ currentDir, setCurrentDir }: Props) => {
  const { add, history } = useStore()
  const editor = useMemo(() => withSuggestions(withReact(createEditor())), [])
  const [isFocused, setIsFocused] = useState(true)
  const [historyIndex, setHistoryIndex] = useState(history.length)
  const [value, setValue] = useState<Node[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ])

  useEffect(() => {
    if (historyIndex > -1 && history[historyIndex]) {
      // setValue([
      //   {
      //     type: 'paragraph',
      //     children: [{ text: history[historyIndex].input }],
      //   },
      // ])
    }
  }, [historyIndex, history])

  useKey(
    'ArrowUp',
    () => historyIndex > 0 && setHistoryIndex(historyIndex - 1),
    {},
    [historyIndex, history],
  )
  useKey(
    'ArrowDown',
    () =>
      historyIndex < history.length - 1 && setHistoryIndex(historyIndex + 1),
    {},
    [historyIndex, history],
  )

  const [target, setTarget] = useState<null | Range>(null)
  const [index, setIndex] = useState(0)
  const [search, setSearch] = useState('')
  const suggestionRef = useRef<HTMLDivElement>(null)
  const renderElement = useCallback(props => <Element {...props} />, [])

  const chars = [
    ...new Set(
      COMMANDS.filter(c => c.toLowerCase().startsWith(search.toLowerCase()))
        .sort((a, b) => a.length - b.length)
        .slice(0, 10),
    ),
  ]

  const onKeyDown = useCallback(
    event => {
      if (target) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault()
            const prevIndex = index >= chars.length - 1 ? 0 : index + 1
            setIndex(prevIndex)
            break
          case 'ArrowUp':
            event.preventDefault()
            const nextIndex = index <= 0 ? chars.length - 1 : index - 1
            setIndex(nextIndex)
            break
          case 'Tab':
          case 'Enter':
            event.preventDefault()
            Transforms.select(editor, target)
            insertSuggestion(editor, chars[index])
            setTarget(null)
            break
          case 'Escape':
            event.preventDefault()
            setTarget(null)
            break
        }
      } else {
        if (event.key === 'Enter') {
          event.preventDefault()
          const input = value.map(n => Node.string(n)).join('\n')
          if (!input) return
          const command = { id: uuidv4(), input, currentDir }
          const cmd = input.split(' ')[0]
          if (PLUGIN_NAMES.includes(cmd)) {
            const plugin = PLUGINS.find(plugin => plugin.name === cmd)
            if (plugin) {
              command.input = 'iframe ' + plugin.src
              add({ ...command, type: 'custom' })
            }
          } else if (CUSTOM_COMMANDS.includes(cmd as CUSTOM_COMMAND)) {
            add({ ...command, type: 'custom' })
          } else {
            add({ ...command, type: 'fallback' })
          }

          Editor.deleteBackward(editor, { unit: 'line' })
          ReactEditor.focus(editor)
          getInput()?.focus()
        }
      }
    },
    [index, search, target, value, CUSTOM_COMMANDS, currentDir, editor],
  )

  useEffect(() => {
    if (target && chars.length > 0 && suggestionRef.current) {
      const el = suggestionRef.current
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      el.style.top = `${rect.top + window.pageYOffset + 24}px`
      el.style.left = `${rect.left + window.pageXOffset}px`
    }
  }, [chars.length, editor, index, search, target])

  return (
    <div
      id="input"
      className="px-8 py-4 focus:outline-none w-full h-full border-t border-gray-800"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          if (isFocused) {
            setValue(newValue)
          }

          const { selection } = editor

          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection)
            const wordBefore = Editor.before(editor, start, { unit: 'word' })
            const before = wordBefore && Editor.before(editor, wordBefore)
            const beforeRange = before && Editor.range(editor, before, start)
            const beforeText = beforeRange && Editor.string(editor, beforeRange)
            const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/)
            const after = Editor.after(editor, start)
            const afterRange = Editor.range(editor, start, after)
            const afterText = Editor.string(editor, afterRange)
            const afterMatch = afterText.match(/^(\s|$)/)

            if (beforeMatch && afterMatch && beforeRange) {
              setTarget(beforeRange)
              setSearch(beforeMatch[1])
              setIndex(0)
              return
            }
          }

          setTarget(null)
        }}
      >
        <Editable
          autoFocus
          className="h-full"
          placeholder=">"
          onKeyDown={onKeyDown}
          renderElement={renderElement}
        />
        {target && chars.length > 0 && (
          <Portal>
            <div
              ref={suggestionRef}
              style={{
                top: '-9999px',
                left: '-9999px',
                position: 'absolute',
                zIndex: 1,
                background: 'black',
              }}
              className="border border-gray-500"
            >
              {chars.map((char, i) => (
                <div
                  key={char}
                  className="px-1"
                  style={{
                    background: i === index ? 'white' : 'transparent',
                    color: i === index ? 'black' : 'white',
                  }}
                >
                  {char}
                </div>
              ))}
            </div>
          </Portal>
        )}
      </Slate>
    </div>
  )
}

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props
  switch (element.type) {
    case 'suggestion':
      return <SuggestionElement {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const SuggestionElement = ({ attributes, children, element }: any) => {
  return (
    <span
      {...attributes}
      contentEditable={false}
      className="inline-block font-bold"
    >
      @{element.character}
      {children}
    </span>
  )
}

const withSuggestions = (editor: ReactEditor) => {
  const { isInline, isVoid } = editor

  editor.isInline = element => {
    return element.type === 'suggestion' ? true : isInline(element)
  }

  editor.isVoid = element => {
    return element.type === 'suggestion' ? true : isVoid(element)
  }

  return editor
}

const insertSuggestion = (editor: ReactEditor, character: string) => {
  const suggestion = { type: 'suggestion', character, children: [{ text: '' }] }
  Transforms.insertNodes(editor, suggestion)
  Transforms.move(editor)
}

export default Input
