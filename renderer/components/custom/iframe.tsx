import React from 'react'

interface Props {
  src: string
}

// Doom in a terminal: iframe https://www.playdosgames.com/play/doom

const Iframe = ({ src }: Props) => {
  return <iframe src={src} style={{ height: ' 30rem', width: '100%' }} />
}

export default Iframe
