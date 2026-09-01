import { Palette } from '@/types';

type History = string[];

interface HistoryState {
  historyIndex: number;
  history: History;
}

interface Action {
  type: string;
  payload?: any;
}

const ADD = 'history/add';
const ADD_PALETTE_CHANGE = 'history/add_palette_change';
const UNDO = 'history/undo';
const REDO = 'history/redo';

export function init(initialPalettizedData: History) {
  return {
    historyIndex: initialPalettizedData.length - 1,
    history: [...initialPalettizedData],
  } as HistoryState;
}

function getUpdatedHistory(state: HistoryState, newItem: string) {
  const history = [...state.history];

  if (state.historyIndex !== history.length - 1) {
    history.length = state.historyIndex + 1;
  }

  history.push(newItem);

  return {
    ...state,
    historyIndex: state.historyIndex + 1,
    history,
  };
}

export function reducers(state: HistoryState, action: Action) {
  const { type, payload } = action;

  // console.log('------------------------------');
  // console.log(action);
  // console.log(state);
  // console.log('------------------------------');

  switch (type) {
    case ADD:
      return getUpdatedHistory(state, payload.palettizedData);

    case ADD_PALETTE_CHANGE: {
      const {
        palettizedData,
        newPalette,
      }: { palettizedData: string; newPalette: Palette } = payload;

      const newPaletteStr = newPalette.colors
        .map((color) => color.replace(/#/, ''))
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
        historyIndex: state.historyIndex - 1,
      };
    case REDO:
      if (!canRedo(state)) return state;

      return {
        ...state,
        historyIndex: state.historyIndex + 1,
      };
    default:
      throw new Error();
  }
}

const addHistory = (palettizedData: string) =>
  ({
    type: ADD,
    payload: {
      palettizedData,
    },
  } as Action);

const addHistoryChangePalette = (palettizedData: string, newPalette: Palette) =>
  ({
    type: ADD_PALETTE_CHANGE,
    payload: {
      palettizedData,
      newPalette,
    },
  } as Action);

const undo = () =>
  ({
    type: UNDO,
  } as Action);

const redo = () =>
  ({
    type: REDO,
  } as Action);

const getLast = (state: HistoryState) =>
  state.history[state.history.length - 1];
const getCurrent = (state: HistoryState) => state.history[state.historyIndex];
const canRedo = (state: HistoryState) =>
  state.historyIndex < state.history.length - 1;
const canUndo = (state: HistoryState) => state.historyIndex > 0;
const getUndoCount = (state: HistoryState) =>
  state.history.length - 1 + state.historyIndex;

export const actions = { addHistory, addHistoryChangePalette, undo, redo };
export const selectors = {
  getLast,
  getCurrent,
  canRedo,
  canUndo,
  getUndoCount,
};
