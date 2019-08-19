const defaultState = {
  notes: {},
  noteId: null,
  showExplorer: true,
  command: null
};

const reducers = (state = defaultState, action) => {
  switch (action.type) {
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.notes
      };
    case 'SET_CONTENT':
      const note = state.notes[state.noteId];
      return note ? ({
        ...state,
        notes: {
          ...state.notes,
          [state.noteId]: {
            ...note,
            content: action.content
          }
        }
      }) : state;
    case 'SET_NAME':
      return state.notes.id ? ({
        ...state.notes.id,
        name: action.name
      }) : state;
    case 'SET_NOTE_ID':
      return {
        ...state,
        noteId: action.id
      };
    case 'TOGGLE_EXPLORER':
      return {
        ...state,
        showExplorer: !state.showExplorer
      }
    case 'SET_TAB':
      return {
        ...state,
        tab: action.tab
      }
    case 'SET_COMMAND':
      return {
        ...state,
        command: action.command
      }
    default: return state;
  }
}

export default reducers;
