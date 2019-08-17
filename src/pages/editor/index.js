import React, { useState, useEffect } from 'react';
import * as firebase from "firebase/app";
import 'firebase/firestore';
import { GlobalHotKeys, configure } from "react-hotkeys";
import uuidv4 from 'uuid/v4';
import { useDebounce } from 'react-use';

import Editor from './editor';
import Explorer from './explorer';
import { useAuth } from "./../../util/auth.js";

import './styles.scss'

configure({
  ignoreEventsCondition: () => false
});

const keyMap = {
  WRITE: 'alt+w',
  PREVIEW: 'alt+p',
  TOGGLE_EXPLORER: 'alt+e'
};

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

  const auth = useAuth();
  const userId = (
    auth && auth.user && auth.user.uid
  ) || getId();

  const handlers = {
    WRITE: () => setTab('write'),
    PREVIEW: () => setTab('preview'),
    TOGGLE_EXPLORER: e => {
      e.preventDefault();
      explorerFlag = !explorerFlag;
      setShowExplorer(explorerFlag);
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
        console.log('notes', notes)
        if (Object.keys(notes).length > 0) {
          const noteId = Object.keys(notes)[0]
          setNoteId(noteId)
          setNote(notes[noteId].content)
        }
      }

      const unsubscribe = firebase.firestore().collection(`users/${userId}/notes`).get().then(onSuccess, setError)
      return () => unsubscribe()
    },
    [userId]
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

  useEffect(
    () => {

    },
    [noteId]
  )

  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers} focused={true} attach={window}>
      <div className="editor-page columns">
        { showExplorer ? (
          <div className='column is-one-fifth'>
            <Explorer notes={notes} />
          </div>
        ) : null }
        <div className='column'>
          <Editor {...{ setTab, tab, note, setNote }} />
        </div>
      </div>
    </GlobalHotKeys >
  )
}
