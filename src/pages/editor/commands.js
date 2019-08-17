import React from 'react';

import './commands.scss'

const COMMANDS = [
  ['New note', 'alt + n'],
  ['Toggle explorer', 'alt + e'],
  ['Preview note', 'alt + p'],
  ['Edit note', 'alt + e'],
  ['Open note', 'alt + o']
]

const Commands = () => {
  return (
    <div className='commands'>
      <h1>Commands</h1>
      <ul>
        {COMMANDS.map(([description, keybinding]) => <li><div>{description}</div><code>{keybinding}</code></li>)}
      </ul>
    </div>
  )
}

export default Commands;
