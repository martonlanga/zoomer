import React, { useEffect, useState } from 'react'
import ipc from '../../lib/ipc'
import useStore from '../../store'
import Input from './input'

const getInput = (): HTMLDivElement | null => {
  const input = document.querySelector<HTMLDivElement>('#input')
  if (input && input.children[0]) {
    return input.childNodes[0] as HTMLDivElement
  }
  return null
}

const Terminal = () => {
  const { history, termOutput } = useStore()
  const [currentDir, setCurrentDir] = useState(
    '/Users/martonlanga/code/extensions/countdown',
  )

  useEffect(() => {
    const cmds = ipc.sendSync('getCommands')
    // console.log(cmds.split(/\s+/))

    const listener = (event: any, data: any) => {
      termOutput(data)
    }

    ipc.on('data', listener)
    return () => {
      ipc.removeListener('data', listener)
    }
  }, [])

  useEffect(() => {
    const input = getInput()
    if (input) {
      input.scrollIntoView({ behavior: 'smooth' })
    }
    console.log('history', history)
  }, [history])

  return (
    <div className="overflow-x-hidden text-white h-screen flex flex-col bg-black">
      <ul className="px-8 py-3">
        {history.map(({ id, input, currentDir, type, out }, i) => (
          <li key={id} className="flex flex-col">
            <p>
              <span className="text-blue-300 mr-4">{currentDir}</span>
              {input}
            </p>
            {out && type === 'fallback' ? (
              <div id={`term-${id}`} />
            ) : (
              <section className="text-gray-500">{out}</section>
            )}
          </li>
        ))}
      </ul>
      <Input currentDir={currentDir} setCurrentDir={setCurrentDir} />
      <style jsx global>{`
        /**
        *  Default styles for xterm.js
        */

        .xterm {
          font-feature-settings: 'liga' 0;
          position: relative;
          user-select: none;
          -ms-user-select: none;
          -webkit-user-select: none;
        }

        .xterm.focus,
        .xterm:focus {
          outline: none;
        }

        .xterm .xterm-helpers {
          position: absolute;
          top: 0;
          /**
            * The z-index of the helpers must be higher than the canvases in order for
            * IMEs to appear on top.
            */
          z-index: 5;
        }

        .xterm .xterm-helper-textarea {
          padding: 0;
          border: 0;
          margin: 0;
          /* Move textarea out of the screen to the far left, so that the cursor is not visible */
          position: absolute;
          opacity: 0;
          left: -9999em;
          top: 0;
          width: 0;
          height: 0;
          z-index: -5;
          /** Prevent wrapping so the IME appears against the textarea at the correct position */
          white-space: nowrap;
          overflow: hidden;
          resize: none;
        }

        .xterm .composition-view {
          /* TODO: Composition position got messed up somewhere */
          background: #000;
          color: #fff;
          display: none;
          position: absolute;
          white-space: nowrap;
          z-index: 1;
        }

        .xterm .composition-view.active {
          display: block;
        }

        .xterm .xterm-viewport {
          /* On OS X this is required in order for the scroll bar to appear fully opaque */
          background-color: #000;
          overflow-y: scroll;
          cursor: default;
          position: absolute;
          right: 0;
          left: 0;
          top: 0;
          bottom: 0;
        }

        .xterm .xterm-screen {
          position: relative;
        }

        .xterm .xterm-screen canvas {
          position: absolute;
          left: 0;
          top: 0;
        }

        .xterm .xterm-scroll-area {
          visibility: hidden;
        }

        .xterm-char-measure-element {
          display: inline-block;
          visibility: hidden;
          position: absolute;
          top: 0;
          left: -9999em;
          line-height: normal;
        }

        .xterm {
          cursor: text;
        }

        .xterm.enable-mouse-events {
          /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
          cursor: default;
        }

        .xterm.xterm-cursor-pointer {
          cursor: pointer;
        }

        .xterm.column-select.focus {
          /* Column selection mode */
          cursor: crosshair;
        }

        .xterm .xterm-accessibility,
        .xterm .xterm-message {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
          z-index: 10;
          color: transparent;
        }

        .xterm .live-region {
          position: absolute;
          left: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .xterm-dim {
          opacity: 0.5;
        }

        .xterm-underline {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

export default Terminal
