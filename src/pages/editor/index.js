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

import './styles.scss'

configure({
  ignoreEventsCondition: () => false
});

const keyMap = {
  WRITE: 'alt+w',
  PREVIEW: 'alt+v',
  TOGGLE_EXPLORER: 'alt+e',
  NEW_NOTE: 'alt+n',
  OPEN: 'alt+p',
  HELP: 'alt+h'
};

const PLACEHOLDERS = {
  NEW_NOTE: 'Create a note with name...',
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

  const handlers = {
    WRITE: () => setTab('write'),
    PREVIEW: e => {
      e.preventDefault();
      setTab('preview');
    },
    TOGGLE_EXPLORER: e => {
      e.preventDefault();
      explorerFlag = !explorerFlag;
      setShowExplorer(explorerFlag);
    },
    NEW_NOTE: () => setShowModal('NEW_NOTE'),
    OPEN: () => setShowModal('OPEN'),
    HELP: e => {
      e.preventDefault();
      setNoteId(null);
    }
  };

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
      }

      const unsubscribe = firebase.firestore().collection(`users/${userId}/notes`).get().then(onSuccess).catch(setError)
      return () => unsubscribe();
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
        case 'NEW_NOTE':
          createNote(e.target.value);
          break;
        case 'OPEN':
          openNote(e.target.value);
          break;
      }
    }
  }

  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers} focused={true} attach={window}>
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
        <div className='column'>
          { noteId ? <Editor {...{ setTab, tab, note, setNote }} canFocus={!showModal} /> : <Commands /> }
        </div>
      </div>
    </GlobalHotKeys >
  )
}
