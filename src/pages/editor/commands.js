import React from 'react';
import { useDispatch } from 'react-redux'

import { HANDLERS } from './hotkeys';

import './commands.scss';

const COMMANDS = [
  ['NEW', 'New note', 'alt + n'],
  ['EXPLORER', 'Toggle explorer', 'alt + e'],
  ['PREVIEW', 'Preview note', 'alt + v'],
  ['WRITE', 'Edit note', 'alt + w'],
  ['OPEN', 'Open note', 'alt + p'],
  ['HELP', 'Show help', 'alt + h'],
  ['DELETE', 'Delete', 'alt + d'],
  ['RENAME', 'Rename', 'alt + r']
]

const Commands = () => {
  const handlers = HANDLERS(useDispatch());

  return (
    <div className='commands'>
      <h1>Commands</h1>
      <ul>
        {
          COMMANDS.map(
            ([id, description, keybinding]) => (
              <li key={keybinding} onClick={ () => (handlers[id] && handlers[id]()) }>
                <div>{description}</div>
                <code>{keybinding}</code>
              </li>
            )
          )
        }
      </ul>
    </div>
  )
}

export default Commands;
