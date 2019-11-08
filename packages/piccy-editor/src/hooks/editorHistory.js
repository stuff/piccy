const ADD = 'history/add';
const ADD_PALETTE_CHANGE = 'history/add_palette_change';
const UNDO = 'history/undo';
const REDO = 'history/redo';

export function init(initialPalettizedData) {
  return {
    historyIndex: initialPalettizedData.length - 1,
    history: [...initialPalettizedData]
  };
}

function getUpdatedHistory(state, newItem) {
  const history = [...state.history];

  if (state.historyIndex !== history.length - 1) {
    history.length = state.historyIndex + 1;
  }

  history.push(newItem);

  return {
    ...state,
    historyIndex: state.historyIndex + 1,
    history
  };
}

export function reducers(state, action) {
  const { type, payload } = action;

  switch (type) {
    case ADD:
      return getUpdatedHistory(state, payload.palettizedData);

    case ADD_PALETTE_CHANGE: {
      const { palettizedData, newPalette } = payload;

      const newPaletteStr = newPalette.colors
        .map(color => color.replace(/#/, ''))
        .join('');

      const newData = palettizedData.replace(
        /([0-9]{1})(.{2})(.{96})(?:(.*))/,
        `$1$2${newPaletteStr}$4`
      );

      return getUpdatedHistory(state, newData);
    }

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

const addHistoryChangePalette = (palettizedData, newPalette) => ({
  type: ADD_PALETTE_CHANGE,
  payload: {
    palettizedData,
    newPalette
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

export const actions = { addHistory, addHistoryChangePalette, undo, redo };
export const selectors = {
  getLast,
  getCurrent,
  canRedo,
  canUndo,
  getUndoCount
};
