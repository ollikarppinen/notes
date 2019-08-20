import React, { useState, useEffect } from 'react';
import * as firebase from "firebase/app";
import 'firebase/firestore';
import uuidv4 from 'uuid/v4';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';

import {
  setNotesAction,
  setNoteIdAction,
  setTabWriteAction,
  setCommandAction,
  renameAction,
  deleteAction
} from '../../actions';

import {
  noteIdSelector,
  showExplorerSelector,
  commandSelector,
  notesSelector
} from '../../selectors';

import HotKeys, { PLACEHOLDERS, HANDLERS } from './hotkeys'
import Editor from './editor';
import Commands from './commands';
import Explorer from './explorer';
import { useAuth } from "./../../util/auth.js";
import Loader from '../../components/Loader';

import './styles.scss'

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

  const noteId = useSelector(noteIdSelector);
  const showExplorer = useSelector(showExplorerSelector);
  const command = useSelector(commandSelector);
  const notes = useSelector(notesSelector);

  const userId = (
    auth && auth.user && auth.user.uid
  ) || getId();

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
      dispatch(renameAction(newName));
    }).catch(error => console.error("Error renaming document: ", error))
  }

  const deleteNote = name => {
    const id = Object.keys(notes).reduce((res, key) => (
      (notes[key] && notes[key].name.toUpperCase() === name.toUpperCase()) ? key : res
    ), null);

    firebase.firestore().collection(`users/${userId}/notes`).doc(id).delete().then(() => {
      if (noteId === id) { dispatch(setNoteIdAction(null)); };
      dispatch(deleteAction(id));
    }).catch(error => console.error("Error deleting document: ", error));
  }

  const openNote = name => {
    const id = Object.keys(notes).reduce((res, key) => (
      (notes[key] && notes[key].name.toUpperCase() === name.toUpperCase()) ? key : res
    ), null);
    if (id) {
      dispatch(setTabWriteAction());
      dispatch(setNoteIdAction(id));
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
          deleteNote(e.target.value);
          break;
        case 'RENAME':
          renameNote(e.target.value);
          break;
      }
    }
  }

  const closeModal = () => dispatch(setCommandAction(null));

  return (
    <div className="editor-page columns">
      <HotKeys />
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
          <Explorer />
        </div>
      ) : null }
      <div className='column full-height'>
        { loading ?
          <Loader /> :
          noteId ?
          <Editor canFocus={!command} userId={userId} /> :
          <Commands />
        }
      </div>
    </div>
  )
}
