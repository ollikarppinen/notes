export const setNotesAction = notes => ({
  type: 'SET_NOTES',
  notes
});

export const setContentAction = content => ({
  type: 'SET_CONTENT',
  content
});

export const renameAction = name => ({
  type: 'RENAME',
  name
});

export const setNoteIdAction = id => ({
  type: 'SET_NOTE_ID',
  id
});

export const toggleExplorerAction = () => ({
  type: 'TOGGLE_EXPLORER'
});

export const setTabAction = tab => ({
  type: 'SET_TAB',
  tab
});

export const setTabWriteAction = () => setTabAction('write');

export const setTabPreviewAction = () => setTabAction('preview');

export const setCommandAction = command => ({
  type: 'SET_COMMAND',
  command
});
