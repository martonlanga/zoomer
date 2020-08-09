import Nav from '../components/nav'
import React, { useRef, useEffect } from 'react'
import Head from 'next/head'

export default function IndexPage() {
  return (
    <div>
      <Nav />
      <Head>
        <title>Zoomer | The Tesla of Terminals</title>
      </Head>
      <div className="py-10 space-y-10">
        <h1 className="text-center text-2xl font-bold">
          The Tesla of Terminals
        </h1>

        <video className="w-full border border-white"></video>
        <ul className="grid grid-cols-2 gap-8">
          <li>
            <h3 className="font-bold">Web based</h3>
            <p className="text-sm text-gray-500">
              Render all your fancy HTML in your terminal
            </p>
          </li>
          <li>
            <h3 className="font-bold">Structured data piping</h3>
            <p className="text-sm text-gray-500">
              We convert your stdout/stdin to JSON, so you can do stuff with it
            </p>
          </li>
          <li>
            <h3 className="font-bold">VSCode's powerful editor included</h3>
            <p className="text-sm text-gray-500">
              No more awkward interactions with vi/nano/pico
            </p>
          </li>
          <li>
            <h3 className="font-bold">Plugins</h3>
            <p className="text-sm text-gray-500">
              Bring your own plugins that replace the standard npm/yarn/git
              commands
            </p>
          </li>
          <li>
            <h3 className="font-bold">Backwards compability</h3>
            <p className="text-sm text-gray-500">
              All your existing shell commands work
            </p>
          </li>
          <li>
            <h3 className="font-bold">Custom `ls` command</h3>
            <p className="text-sm text-gray-500">
              A better way to navigate your file system
            </p>
          </li>
        </ul>
        <p className="text-xs tracking-tighter text-gray-500 text-center">
          <span className="text-gray-400 underline">Zoomer</span> = young person
          who doesn't know bash{' '}
          <span className="text-gray-700">(unlike boomers)</span> and would
          rather use Zoomer, a GUI based terminal
        </p>
      </div>
    </div>
  )
}
