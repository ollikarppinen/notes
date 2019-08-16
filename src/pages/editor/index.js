import * as React from "react";

import Editor from './editor';
import Explorer from './explorer';

import './styles.scss'

export default function EditorPage(props) {
  return (
    <div className='editor-page columns'>
      <div className='column is-one-fifth'>
        <Explorer />
      </div>
      <div className='column'>
        <Editor />
      </div>
    </div>
  )
}
