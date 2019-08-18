import React from 'react';
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

const Editor = ({ tab, setTab, note, setNote }) => (
  <div className='editor-page container'>
    <ReactMde
      value={note}
      onChange={setNote}
      selectedTab={tab}
      onTabChange={setTab}
      generateMarkdownPreview={markdown => Promise.resolve(converter.makeHtml(markdown))}
      minEditorHeight='calc(100% - 65px)'
      textAreaProps={{ autoFocus: true }}
    />
  </div>
);

export default Editor;
