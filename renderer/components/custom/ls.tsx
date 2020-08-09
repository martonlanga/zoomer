import React, { useEffect, useRef, useState } from 'react'
import { useKey } from 'react-use'
import { FileEntry } from '../../../electron-src/interfaces'
import { getFiles } from '../../lib'
import { getInput } from '../terminal/input'

interface Props {
  currentDir: string
}

const Ls = ({ currentDir }: Props) => {
  const firstTabRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (firstTabRef.current) {
      firstTabRef.current.focus()
    }
  }, [])

  useKey('Escape', () => getInput()?.focus(), {}, [getInput])

  return (
    <div className="flex space-x-3">
      <Tab dir={currentDir} ref={firstTabRef} />
    </div>
  )
}

const Tab = React.forwardRef<
  HTMLDivElement,
  { dir: string; focusPrev?: () => void }
>(({ dir, focusPrev }, ref) => {
  const files = getFiles(dir)
  const last = files.length - 1

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [focused, setFocused] = useState(false)
  const selected: FileEntry | undefined = files[selectedIndex]

  const nextTabRef = useRef<HTMLDivElement>(null)

  const onSelect = (index: number) => {
    setSelectedIndex(index)
  }

  const focusNext = () => {
    if (focused && selected?.isDir && nextTabRef.current) {
      nextTabRef.current.focus()
    }
  }

  useKey(
    'ArrowUp',
    () => focused && onSelect(selectedIndex > 0 ? selectedIndex - 1 : last),
    {},
    [selectedIndex, files, last],
  )
  useKey(
    'ArrowDown',
    () =>
      focused &&
      onSelect(selectedIndex < files.length - 1 ? selectedIndex + 1 : 0),
    {},
    [selectedIndex, files],
  )
  useKey('ArrowRight', focusNext, {}, [focused, selected, nextTabRef])
  useKey('ArrowLeft', focusPrev, {}, [focusPrev])

  return (
    <>
      <div
        ref={ref}
        onFocus={() => {
          setFocused(true)
        }}
        onBlur={() => setFocused(false)}
        tabIndex={0}
        className="border border-gray-700 focus:outline-none focus:border-gray-200 w-48 p-1 overflow-y-auto"
        style={{ maxHeight: '15rem' }}
      >
        {files.map((file, i) => (
          <div
            key={file.path}
            onClick={() => setSelectedIndex(i)}
            className="text-blue-600"
            style={{
              background:
                focused && selectedIndex === i ? 'white' : 'transparent',
              color:
                focused && selectedIndex === i
                  ? 'black'
                  : file.isDir
                  ? undefined // default to sexy classname blue
                  : 'white',
            }}
          >
            {file.name}
          </div>
        ))}
      </div>
      {selected?.isDir && getFiles(selected.path).length > 0 && (
        <Tab
          dir={selected.path}
          ref={nextTabRef}
          focusPrev={() => {
            if (ref) {
              // @ts-ignore
              ref.current.focus()
            }
          }}
        />
      )}
    </>
  )
})

export default Ls
