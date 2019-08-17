import React, { useEffect, useRef } from 'react';
import ReactMde from "react-mde";

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

export default function Editor({ tab, setTab, note, setNote, loading }) {
  const editorEl = useRef(null);

  useEffect(
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
            value={note}
            onChange={setNote}
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
