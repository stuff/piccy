const ADD = 'history/add';
const UNDO = 'history/undo';
const REDO = 'history/redo';

export function init(initialPalettizedData) {
  return {
    historyIndex: initialPalettizedData.length - 1,
    history: [...initialPalettizedData]
  };
}

export function reducers(state, action) {
  const { type, payload } = action;

  switch (type) {
    case ADD:
      const history = [...state.history];
      if (state.historyIndex !== history.length - 1) {
        history.length = state.historyIndex + 1;
      }

      history.push(payload.palettizedData);
      return {
        ...state,
        historyIndex: state.historyIndex + 1,
        history
      };
    case UNDO:
      if (!canUndo(state)) return state;

      return {
        ...state,
        historyIndex: state.historyIndex - 1
      };
    case REDO:
      if (!canRedo(state)) return state;

      return {
        ...state,
        historyIndex: state.historyIndex + 1
      };
    default:
      throw new Error();
  }
}

const addHistory = palettizedData => ({
  type: ADD,
  payload: {
    palettizedData
  }
});

const undo = () => ({
  type: UNDO
});

const redo = () => ({
  type: REDO
});

const getLast = state => state.history[state.history.length - 1];
const getCurrent = state => state.history[state.historyIndex];
const canRedo = state => state.historyIndex < state.history.length - 1;
const canUndo = state => state.historyIndex > 0;
const getUndoCount = state => state.history.length - 1 + state.historyIndex;

export const actions = { addHistory, undo, redo };
export const selectors = {
  getLast,
  getCurrent,
  canRedo,
  canUndo,
  getUndoCount
};
