const defaultState = {
  notes: {},
  noteId: null,
  showExplorer: true,
  command: null,
  tab: 'write'
};

const reducers = (state = defaultState, action) => {
  let note;
  switch (action.type) {
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.notes
      };
    case 'SET_CONTENT':
      note = state.notes[state.noteId];
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
    case 'RENAME':
      note = state.notes[state.noteId];
      return note ? ({
        ...state,
        notes: {
          ...state.notes,
          [state.noteId]: {
            ...note,
            name: action.name
          }
        }
      }) : state;
    case 'DELETE':
      const { [action.id]: deletedNote, ...notes } = state.notes
      return {
        ...state,
        notes
      };
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
