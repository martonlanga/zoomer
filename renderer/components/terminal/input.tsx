import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useKey } from 'react-use'
import { createEditor, Editor, Node, Range, Text, Transforms } from 'slate'
import { Editable, ReactEditor, Slate, withReact } from 'slate-react'
import { v4 as uuidv4 } from 'uuid'
import { CUSTOM_COMMAND } from '../../../electron-src/interfaces'
import useStore from '../../store'

/**
 * Streaming data
 *
 * Check if message's id is the same as the previous
 * If yes, continue writing to xterm, until stream is over
 */

const CUSTOM_COMMANDS: CUSTOM_COMMAND[] = ['ls', 'edit']

interface Props {
  currentDir: string
  setCurrentDir: (newDir: string) => void
}

const Input = ({ currentDir, setCurrentDir }: Props) => {
  const { add, history } = useStore()
  const editor = useMemo(
    () => withSyntaxHighlighting(withReact(createEditor())),
    [],
  )
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
      setValue([
        {
          type: 'paragraph',
          children: [{ text: history[historyIndex].input }],
        },
      ])
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

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, [])

  const enter = () => {
    setHistoryIndex(history.length + 1)

    const input = value.map(n => Node.string(n)).join('\n')
    if (!input) return
    const Command = { id: uuidv4(), input, currentDir }
    if (CUSTOM_COMMANDS.includes(input.split(' ')[0] as CUSTOM_COMMAND)) {
      add({ ...Command, type: 'custom' })
    } else {
      add({ ...Command, type: 'fallback' })
    }

    Editor.deleteBackward(editor, { unit: 'line' })
    ReactEditor.focus(editor)
  }

  return (
    <div
      id="input"
      className="px-8 py-3 focus:outline-none w-full h-full"
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
        }}
      >
        <Editable
          autoFocus
          className="h-full"
          placeholder=">"
          renderLeaf={renderLeaf}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault()
              enter()
            }
          }}
        />
      </Slate>
    </div>
  )
}

const Leaf = (props: any) => {
  return (
    <span
      {...props.attributes}
      style={{ color: props.leaf.command ? 'red' : 'white' }}
    >
      {props.children}
    </span>
  )
}

const withSyntaxHighlighting = (editor: ReactEditor) => {
  const { insertText } = editor

  editor.insertText = text => {
    const { selection } = editor

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const beforeText = Editor.string(editor, range)

      // todo: check if actually a command
      const type = !!beforeText

      if (type) {
        Transforms.insertText(editor, ' ')
        Transforms.setNodes(
          editor,
          { command: true },
          { at: range, match: n => Text.isText(n), split: true },
        )
        return
      }
    }

    insertText(text)
  }

  return editor
}

export default Input
