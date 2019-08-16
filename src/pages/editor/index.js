import * as React from "react";

import { GlobalHotKeys, configure } from "react-hotkeys";

import Editor from './editor';
import Explorer from './explorer';

import './styles.scss'

configure({
  ignoreEventsCondition: () => false
});

const keyMap = {
  WRITE: 'alt+w',
  PREVIEW: 'alt+p',
  TOGGLE_EXPLORER: 'alt+e'
};

export default function EditorPage(props) {
  const [tab, setTab] = React.useState('write');
  // TODO: Hacky. Replace with action (?)
  let explorerFlag = true;
  const [showExplorer, setShowExplorer] = React.useState(explorerFlag);

  const handlers = {
    WRITE: () => setTab('write'),
    PREVIEW: () => setTab('preview'),
    TOGGLE_EXPLORER: e => {
      e.preventDefault();
      explorerFlag = !explorerFlag;
      setShowExplorer(explorerFlag);
    }
  };

  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers} focused={true} attach={window}>
      <div className="editor-page columns">
        { showExplorer ? (
          <div className='column is-one-fifth'>
            <Explorer />
          </div>
        ) : null }
        <div className='column'>
          <Editor {...{ setTab, tab }} />
        </div>
      </div>
    </GlobalHotKeys >
  )
}
