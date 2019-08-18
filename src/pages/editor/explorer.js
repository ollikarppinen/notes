import React from 'react';

import './explorer.scss'

const Explorer = ({ notes, noteId, setNoteId, handleHelp }) => (
  <div className='explorer'>
    <h1>Explorer<span onClick={handleHelp}> [?]</span></h1>
    {
      (notes && Object.keys(notes).length > 0) ? (
        <ul>
          {
            Object.keys(notes).map(id => (
              <li key={id} onClick={() => setNoteId(id) }>{`${id === noteId ? '-> ' : '   '}${notes[id].name}`}</li>
            ))
          }
        </ul>
      ) : 'No notes'
    }
  </div>
);

export default Explorer;
