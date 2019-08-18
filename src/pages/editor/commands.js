import React from 'react';

import './commands.scss'

const COMMANDS = [
  ['New note', 'alt + n'],
  ['Toggle explorer', 'alt + e'],
  ['Preview note', 'alt + p'],
  ['Edit note', 'alt + w'],
  ['Open note', 'alt + o'],
  ['Show commands', 'alt + h']
]

const Commands = () => {
  return (
    <div className='commands'>
      <h1>Commands</h1>
      <ul>
        {COMMANDS.map(([description, keybinding]) => <li key={keybinding}><div>{description}</div><code>{keybinding}</code></li>)}
      </ul>
    </div>
  )
}

export default Commands;
