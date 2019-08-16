import * as React from "react";
import ReactMde from "react-mde";
import * as firebase from "firebase/app";
import 'firebase/firestore';

import { GlobalHotKeys, configure } from "react-hotkeys";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import './editor.scss';
import { useAuth } from "./../../util/auth.js";
import { useDebounce } from 'react-use';
import uuidv4 from 'uuid/v4';

configure({
  ignoreEventsCondition: () => false
});

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});
converter.setFlavor('github');

const keyMap = {
  WRITE: 'alt+w',
  PREVIEW: 'alt+p'
};

export default function Editor(_props) {
  const auth = useAuth();
  const userUid = (
    auth && auth.user && auth.user.uid
  ) || getUuid();

  const editorEl = React.useRef(null);

  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [doc, setDoc] = React.useState('');
  const [tab, setTab] = React.useState('write');

  React.useEffect(
    () => {
      if (!userUid) { return }

      const handleDocSet = response => {
        setLoading(false);
        const data = response && response.data && response.data();
        const doc = data ? (data.doc || '') : '';
        setDoc(doc);
      }

      const unsubscribe = firebase.firestore().collection('notes').doc(userUid).onSnapshot(handleDocSet, setError)
      return () => unsubscribe()
    },
    [userUid]
  )

  useDebounce(
    () => {
      firebase.firestore().collection('notes').doc(userUid).set({
        doc: doc
      })
    },
    2000,
    [doc]
  );

  React.useEffect(
    () => focusEditor(editorEl, tab),
    [tab]
  )

  const handlers = {
    WRITE: () => setTab('write'),
    PREVIEW: () => setTab('preview')
  };

  focusEditor(editorEl, tab)

  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers} className="editor-page container" focused={true} attach={window}>
      {
        loading ? <h1>Loading...</h1> : (
          <ReactMde
            ref={editorEl}
            value={doc}
            onChange={setDoc}
            selectedTab={tab}
            onTabChange={setTab}
            generateMarkdownPreview={markdown => Promise.resolve(converter.makeHtml(markdown))}
            minEditorHeight='calc(100% - 65px)'
          />
        )
      }
    </GlobalHotKeys>
  );
}

const getUuid = () => {
  const uuid = localStorage.getItem('notes-session-uuid')
  if (uuid) { return uuid }
  const newUuid = uuidv4();
  localStorage.setItem('notes-session-uuid', newUuid);
  return newUuid
}

const focusEditor = (el, tab) => {
  if (tab === 'write' && el.current && el.current.textAreaRef) {
    el.current.textAreaRef.focus()
  }
}
