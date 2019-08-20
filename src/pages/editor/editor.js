import React from 'react';
import ReactMde from "react-mde";
import { useDebounce } from 'react-use';
import { useDispatch, useSelector } from 'react-redux'
import * as firebase from "firebase/app";
import 'firebase/firestore';

import {
  setTabAction,
  setContentAction
} from '../../actions';
import {
  userUidSelector,
  tabSelector,
  noteIdSelector,
  contentSelector
} from '../../selectors';

import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import './editor.scss';

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});
converter.setFlavor('github');

const Editor = () => {
  const dispatch = useDispatch();

  const userUid = useSelector(userUidSelector);
  const content = useSelector(contentSelector);
  const noteId = useSelector(noteIdSelector);
  const tab = useSelector(tabSelector);

  useDebounce(
    () => {
      if (!noteId || !userUid) { return }

      firebase.firestore().collection(`users/${userUid}/notes`).doc(noteId).update({
        content: content
      })
    },
    2000,
    [content]
  );

  return (
    <div className='editor-page container'>
      <ReactMde
        value={content}
        onChange={content => dispatch(setContentAction(content))}
        selectedTab={tab}
        onTabChange={tab => dispatch(setTabAction(tab))}
        generateMarkdownPreview={markdown => Promise.resolve(converter.makeHtml(markdown))}
        minEditorHeight='calc(100% - 65px)'
        textAreaProps={{ autoFocus: true }}
      />
    </div>
  )
};

export default Editor;
