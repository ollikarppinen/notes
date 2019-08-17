import * as React from "react";

import { GlobalHotKeys, configure } from "react-hotkeys";
import uuidv4 from 'uuid/v4';

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

const getUuid = () => {
  const uuid = localStorage.getItem('notes-session-uuid')
  if (uuid) { return uuid }
  const newUuid = uuidv4();
  localStorage.setItem('notes-session-uuid', newUuid);
  return newUuid
}

export default function EditorPage(props) {
  const [tab, setTab] = React.useState('write');
  // TODO: Hacky. Replace with action (?)
  let explorerFlag = true;
  const [showExplorer, setShowExplorer] = React.useState(explorerFlag);

  const auth = useAuth();
  const userUid = (
    auth && auth.user && auth.user.uid
  ) || getUuid();

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
          <Editor {...{ setTab, tab, userUid }} />
        </div>
      </div>
    </GlobalHotKeys >
  )
}
