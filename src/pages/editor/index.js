import * as React from "react";
import ReactMde from "react-mde";
// import ReactDOM from "react-dom";
import * as firebase from "firebase/app";
import 'firebase/firestore';

import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import './styles.scss';
import { useAuth } from "./../../util/auth.js";
import { useDebounce } from 'react-use';

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});

converter.setFlavor('github');

export default function EditorPage(props) {
  const auth = useAuth();
  const userUid = auth && auth.user && auth.user.uid

  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [doc, setDoc] = React.useState('');
  const [tab, setTab] = React.useState("write");

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

  return (
    <div className="editor-page container">
      {
        loading ? <h1>Loading...</h1> : (
          <ReactMde
            value={doc}
            onChange={setDoc}
            selectedTab={tab}
            onTabChange={setTab}
            generateMarkdownPreview={markdown =>
              Promise.resolve(converter.makeHtml(markdown))
            }
            minEditorHeight='calc(100% - 65px)'
          />
        )
      }
    </div>
  );
}
