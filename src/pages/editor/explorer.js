import React from 'react';

import './explorer.scss'

export default function Explorer({ notes, noteId, selectNote }) {
  return (
    <div className='explorer'>
      <h1>Explorer</h1>
      {
        (notes && Object.keys(notes).length > 0) ? (
          <ul>
            {
              Object.keys(notes).map(id => (
                <li onClick={ () => selectNote(id) }>{`${id === noteId ? '-> ' : '   '}${notes[id].name}`}</li>
              ))
            }
          </ul>
        ) : 'No notes'
      }
    </div>
  )
}
