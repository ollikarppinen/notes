import React, { useState, useEffect, useRef } from 'react';
import * as firebase from "firebase/app";
import 'firebase/firestore';
import { GlobalHotKeys, configure } from "react-hotkeys";
import uuidv4 from 'uuid/v4';
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'react-modal';

import {
  setNotesAction,
  setNoteIdAction,
  toggleExplorerAction,
  setTabWriteAction,
  setTabPreviewAction,
  setCommandAction
} from '../../actions';

import Editor from './editor';
import Commands from './commands';
import Explorer from './explorer';
import { useAuth } from "./../../util/auth.js";
import Loader from '../../components/Loader';

import './styles.scss'

configure({
  ignoreEventsCondition: () => false
});

const keyMap = {
  WRITE: 'alt+w',
  PREVIEW: 'alt+v',
  EXPLORER: 'alt+e',
  NEW: 'alt+n',
  OPEN: 'alt+p',
  HELP: 'alt+h',
  RENAME: 'alt+r',
  DELETE: 'alt+d'
};

const PLACEHOLDERS = {
  NEW: 'Create a note with name...',
  OPEN: 'Open note by name...',
  RENAME: 'Rename note...',
  DELETE: 'Delete note by name...'
}

const getId = () => {
  const uuid = localStorage.getItem('notes-session-uuid')
  if (uuid) { return uuid }
  const newUuid = uuidv4();
  localStorage.setItem('notes-session-uuid', newUuid);
  return newUuid
}

export default function EditorPage(props) {
  const dispatch = useDispatch();
  const auth = useAuth();

  const [loading, setLoading] = useState(true);

  const noteId = useSelector(({ state: { noteId } }) => noteId);
  const showExplorer = useSelector(({ state: { showExplorer } }) => showExplorer);
  const command = useSelector(({ state: { command } }) => command);
  const notes = useSelector(({ state: { notes } }) => notes);

  const userId = (
    auth && auth.user && auth.user.uid
  ) || getId();

  const handleNew = () => dispatch(setCommandAction('NEW'));
  const handleOpen = () => dispatch(setCommandAction('OPEN'));
  const handleHelp = () => dispatch(setNoteIdAction(null));
  const handleWrite = () => dispatch(setTabWriteAction());
  const handlePreview = () => dispatch(setTabPreviewAction());
  const handleExplorer = () => dispatch(toggleExplorerAction());
  const handleDelete = () => dispatch(setCommandAction('DELETE'));
  const handleRename = () => dispatch(setCommandAction('RENAME'));

  const handlers = {
    WRITE: handleWrite,
    PREVIEW: handlePreview,
    EXPLORER: handleExplorer,
    NEW: handleNew,
    OPEN: handleOpen,
    HELP: handleHelp,
    DELETE: handleDelete,
    RENAME: handleRename
  };

  const handlersWithoutDefault = Object.keys(handlers).reduce((res, k) => {
    res[k] = e => {
      e.preventDefault();
      handlers[k]();
    }
    return res;
  }, {});

  useEffect(
    () => {
      if (!userId) { return }

      const onSuccess = querySnapshot => {
        const notes = {};
        querySnapshot.forEach(note => {
          notes[note.id] = note.data()
        });
        dispatch(setNotesAction(notes));

        if (Object.keys(notes).length > 0) {
          const id = Object.keys(notes)[0]
          dispatch(setNoteIdAction(id))
        }
        setLoading(false);
      }

      setLoading(true);
      firebase.firestore().collection(`users/${userId}/notes`).get()
        .then(onSuccess)
        .catch(error => console.error("Error getting notes: ", error))
      return () => {};
    },
    [userId]
  )

  const closeModal = () => dispatch(setCommandAction(null));

  const createNote = name => {
    const newNote = {
      content: '',
      name: name
    }
    firebase.firestore().collection(`users/${userId}/notes`).add(newNote).then(docRef => {
      dispatch(setNotesAction({ [docRef.id]: newNote, ...notes }))
      dispatch(setNoteIdAction(docRef.id))
    }).catch(error => console.error("Error adding document: ", error))
  }

  const renameNote = newName => {
    if (!noteId || !notes[noteId]) { return }

    firebase.firestore().collection(`users/${userId}/notes`).doc(noteId).update({
      name: newName
    }).then(() => {
      notes[noteId].name = newName;
      dispatch(setNotesAction(notes));
    }).catch(error => console.error("Error renaming document: ", error))
  }

  const openNote = name => {
    const id = Object.keys(notes).reduce((res, key) => (
      (notes[key] && notes[key].name.toUpperCase() === name.toUpperCase()) ? key : res
    ), null);
    if (id) {
      dispatch(setTabWriteAction());
      dispatch(setNoteIdAction(id))
    };
  }

  const handleKeyUp = e => {
    if (e.key === 'Enter') {
      dispatch(setCommandAction(null));
      switch (command) {
        case 'NEW':
          createNote(e.target.value);
          break;
        case 'OPEN':
          openNote(e.target.value);
          break;
        case 'DELETE':
          openNote(e.target.value);
          break;
        case 'RENAME':
          renameNote(e.target.value);
          break;
      }
    }
  }

  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlersWithoutDefault} focused={true} attach={window}>
      <div className="editor-page columns">
        <Modal
          isOpen={!!command}
          onRequestClose={closeModal}
          contentLabel="New note modal"
          className='editor-modal'
          ariaHideApp={false}
          shouldCloseOnEsc
          shouldReturnFocusAfterClose
          style={{ overlay: { backgroundColor: 'rgba(255, 255, 255, 0)'}}}
        >
          <div className='container'>
            <input autoFocus placeholder={PLACEHOLDERS[command]} onKeyUp={handleKeyUp} />
          </div>
        </Modal>
        { showExplorer ? (
          <div className='column is-one-fifth'>
            <Explorer {...{ notes, noteId, handleHelp }} setNoteId={id => dispatch(setNoteIdAction(id))} />
          </div>
        ) : null }
        <div className='column full-height'>
          { loading ?
            <Loader /> :
            noteId ?
            <Editor canFocus={!command} userId={userId} /> :
            <Commands { ...{ handlers } } />
          }
        </div>
      </div>
    </GlobalHotKeys >
  )
}
