import React, { useCallback, useMemo, useState } from 'react'
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

const CUSTOM_COMMANDS: CUSTOM_COMMAND[] = ['ls']

interface Props {
  currentDir: string
  setCurrentDir: (newDir: string) => void
}

const Input = ({ currentDir, setCurrentDir }: Props) => {
  const add = useStore(state => state.add)
  const editor = useMemo(
    () => withSyntaxHighlighting(withReact(createEditor())),
    [],
  )

  const [value, setValue] = useState<Node[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ])

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, [])

  const enter = () => {
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
  useKey('Enter', enter, {}, [value])

  return (
    <div id="input" className="px-8 py-3 focus:outline-none w-full">
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <Editable
          autoFocus
          placeholder=">"
          renderLeaf={renderLeaf}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault()
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
