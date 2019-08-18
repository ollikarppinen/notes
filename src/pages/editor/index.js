import React, { useState, useEffect, useRef } from 'react';
import * as firebase from "firebase/app";
import 'firebase/firestore';
import { GlobalHotKeys, configure } from "react-hotkeys";
import uuidv4 from 'uuid/v4';
import { useDebounce } from 'react-use';
import Modal from 'react-modal';

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
  HELP: 'alt+h'
};

const PLACEHOLDERS = {
  NEW: 'Create a note with name...',
  OPEN: 'Open note by name...'
}

const getId = () => {
  const uuid = localStorage.getItem('notes-session-uuid')
  if (uuid) { return uuid }
  const newUuid = uuidv4();
  localStorage.setItem('notes-session-uuid', newUuid);
  return newUuid
}

export default function EditorPage(props) {
  const [tab, setTab] = useState('write');
  // TODO: Hacky. Replace with action (?)
  let explorerFlag = true;
  const [showExplorer, setShowExplorer] = useState(explorerFlag);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [notes, setNotes] = useState(null);
  const [showModal, setShowModal] = useState(null);

  const auth = useAuth();
  const userId = (
    auth && auth.user && auth.user.uid
  ) || getId();

  const handleNew = () => setShowModal('NEW');
  const handleOpen = () => setShowModal('OPEN');
  const handleHelp = () => setNoteId(null);
  const handleWrite = () => setTab('write');
  const handlePreview = () => setTab('preview');
  const handleExplorer = () => {
    explorerFlag = !explorerFlag;
    setShowExplorer(explorerFlag);
  }

  const handlers = {
    WRITE: handleWrite,
    PREVIEW: handlePreview,
    EXPLORER: handleExplorer,
    NEW: handleNew,
    OPEN: handleOpen,
    HELP: handleHelp
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
        setNotes(notes);

        if (Object.keys(notes).length > 0) {
          const noteId = Object.keys(notes)[0]
          setNoteId(noteId)
          setNote(notes[noteId].content)
        }
        setLoading(false);
      }

      setLoading(true);
      firebase.firestore().collection(`users/${userId}/notes`).get().then(onSuccess).catch(setError)
      return () => {};
    },
    [userId]
  )

  useEffect(
    () => {
      if (!noteId) { return }
      setNote(notes[noteId].content)
    },
    [noteId]
  )

  useEffect(
    () => {
      if (!noteId || !userId) { return }
      notes[noteId].content = note
      setNotes(notes)
    },
    [note]
  )

  useDebounce(
    () => {
      if (!noteId || !userId) { return }
      firebase.firestore().collection(`users/${userId}/notes`).doc(noteId).update({
        content: note
      })
    },
    2000,
    [note]
  );

  const closeModal = () => setShowModal(false);

  const createNote = name => {
    const newNote = {
      content: '',
      name: name
    }
    firebase.firestore().collection(`users/${userId}/notes`).add(newNote).then(docRef => {
      setNotes({ [docRef.id]: newNote, ...notes })
      setNoteId(docRef.id)
    }).catch(error => console.error("Error adding document: ", error))
  }

  const openNote = name => {
    const id = Object.keys(notes).reduce((res, key) => (
      (notes[key] && notes[key].name.toUpperCase() === name.toUpperCase()) ? key : res
    ), null);
    if (id) {
      setTab('write')
      setNoteId(id)
    };
  }

  const handleKeyUp = e => {
    if (e.key === 'Enter') {
      setShowModal(false);
      switch (showModal) {
        case 'NEW':
          createNote(e.target.value);
          break;
        case 'OPEN':
          openNote(e.target.value);
          break;
      }
    }
  }

  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlersWithoutDefault} focused={true} attach={window}>
      <div className="editor-page columns">
        <Modal
          isOpen={!!showModal}
          onRequestClose={closeModal}
          contentLabel="New note modal"
          className='editor-modal'
          ariaHideApp={false}
          shouldCloseOnEsc
          shouldReturnFocusAfterClose
          style={{ overlay: { backgroundColor: 'rgba(255, 255, 255, 0)'}}}
        >
          <div className='container'>
            <input autoFocus placeholder={PLACEHOLDERS[showModal]} onKeyUp={handleKeyUp} />
          </div>
        </Modal>
        { showExplorer ? (
          <div className='column is-one-fifth'>
            <Explorer notes={notes} noteId={noteId} selectNote={setNoteId} />
          </div>
        ) : null }
        <div className='column full-height'>
          { loading ?
            <Loader /> :
            noteId ?
            <Editor {...{ setTab, tab, note, setNote }} canFocus={!showModal} /> :
            <Commands { ...{ handlers } } />
          }
        </div>
      </div>
    </GlobalHotKeys >
  )
}
