import { createSelector } from 'reselect';

export const notesSelector = ({ state }) => state.notes;
export const noteIdSelector = ({ state }) => state.noteId;
export const showExplorerSelector = ({ state }) => state.showExplorer;
export const commandSelector = ({ state }) => state.command;
export const tabSelector = ({ state }) => state.tab;

export const noteSelector = createSelector(
  notesSelector,
  noteIdSelector,
  (notes, noteId) => notes[noteId] ? notes[noteId] : null
);

export const contentSelector = createSelector(
  noteSelector,
  note => note && note.content
);

export const nameSelector = createSelector(
  noteSelector,
  note => note && note.name
);

export const nameIdSelector = createSelector(
  notesSelector,
  notes => Object.keys(notes).map(k => [notes[k].name, k])
);
