import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  setNoteIdAction
} from '../../actions';

import {
  noteIdSelector,
  nameIdSelector
} from '../../selectors';

import './explorer.scss'

const Explorer = () => {
  const dispatch = useDispatch();
  const handleHelp = () => dispatch(setNoteIdAction(null));
  const handleOpen = id => dispatch(setNoteIdAction(id))

  const noteId = useSelector(noteIdSelector);
  const nameIds = useSelector(nameIdSelector);

  return (
    <div className='explorer'>
      <h1>Explorer<span onClick={handleHelp}> [?]</span></h1>
      { nameIds.length > 0 ? (
        <ul>
          {nameIds.map(([name, id]) => (
            <li key={id} onClick={handleOpen}>
              { (id === noteId ? '-> ' : '   ') + name }
            </li>
            ))
          }
        </ul>
        ) : 'No notes'
      }
    </div>
  );
}

export default Explorer;
