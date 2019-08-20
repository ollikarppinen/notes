import React from 'react';
import { GlobalHotKeys, configure } from "react-hotkeys";
import { useDispatch } from 'react-redux';

import {
  setNoteIdAction,
  toggleExplorerAction,
  setTabWriteAction,
  setTabPreviewAction,
  setCommandAction
} from '../../actions';

configure({
  ignoreEventsCondition: () => false
});

export const KEY_MAP = {
  WRITE: 'alt+w',
  PREVIEW: 'alt+v',
  EXPLORER: 'alt+e',
  NEW: 'alt+n',
  OPEN: 'alt+p',
  HELP: 'alt+h',
  RENAME: 'alt+r',
  DELETE: 'alt+d'
};

export const PLACEHOLDERS = {
  NEW: 'Create a note with name...',
  OPEN: 'Open note by name...',
  RENAME: 'Rename note...',
  DELETE: 'Delete note by name...'
}

export const HANDLERS = dispatch => ({
  WRITE: () => dispatch(setTabWriteAction()),
  PREVIEW: () => dispatch(setTabPreviewAction()),
  EXPLORER: () => dispatch(toggleExplorerAction()),
  NEW: () => dispatch(setCommandAction('NEW')),
  OPEN: () => dispatch(setCommandAction('OPEN')),
  HELP: () => dispatch(setNoteIdAction(null)),
  DELETE: () => dispatch(setCommandAction('DELETE')),
  RENAME: () => dispatch(setCommandAction('RENAME'))
});

const HotKeys = () => {
  const handlers = HANDLERS(useDispatch());

  const handlersWithoutDefault = Object.keys(handlers).reduce((res, k) => {
    res[k] = e => {
      e.preventDefault();
      handlers[k]();
    }
    return res;
  }, {});

  return (
    <GlobalHotKeys
      keyMap={KEY_MAP}
      handlers={handlersWithoutDefault}
      focused={true}
      attach={window}
    />
  )
}

export default HotKeys;
