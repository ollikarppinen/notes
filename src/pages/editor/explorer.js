import React, { useState, useEffect } from 'react';

import './explorer.scss'

export default function Explorer({ notes }) {

  return (
    <div className='explorer'>
      <h1>Explorer</h1>
      {
        notes ? (
          <ul>
            {Object.keys(notes).map(id => (<li>{notes[id].name}</li>))}
          </ul>
        ) : null
      }
    </div>
  )
}