import * as React from "react";
import ReactMde from "react-mde";
import * as firebase from "firebase/app";
import 'firebase/firestore';

import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import './editor.scss';
import { useDebounce } from 'react-use';

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});
converter.setFlavor('github');

export default function Editor({ tab, setTab, userUid }) {
  const editorEl = React.useRef(null);

  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [doc, setDoc] = React.useState('');

  React.useEffect(
    () => {
      if (!userUid) { return }

      const handleDocSet = response => {
        setLoading(false);
        const data = response && response.data && response.data();
        const doc = data ? (data.doc || '') : '';
        setDoc(doc);
      }

      const unsubscribe = firebase.firestore().collection('users').doc(userUid).onSnapshot(handleDocSet, setError)
      return () => unsubscribe()
    },
    [userUid]
  )

  useDebounce(
    () => {
      firebase.firestore().collection('users').doc(userUid).set({
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

  focusEditor(editorEl, tab)

  return (
    <div className='editor-page container'>
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
    </div>
  );
}

const focusEditor = (el, tab) => {
  if (tab === 'write' && el.current && el.current.textAreaRef) {
    el.current.textAreaRef.focus()
  }
}
