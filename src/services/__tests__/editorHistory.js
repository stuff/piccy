import { useReducer } from 'react';

import { act, renderHook } from '@testing-library/react-hooks';
import { reducers, actions, init, selectors } from '../editorHistory';
// import expectExport from 'expect';

const initialDataMock = 'INITIAL MOCK';

let result;
let dispatch;

beforeEach(() => {
  ({ result } = renderHook(() =>
    useReducer(reducers, [initialDataMock], init)
  ));
  [, dispatch] = result.current;
});

it('should have initial state', () => {
  const [state] = result.current;

  expect(state.historyIndex).toEqual(0);
  expect(state.history).toEqual([initialDataMock]);
});

it('should add 1 element to history', () => {
  const palettizedData = 'NEW HISTORY STATE';
  act(() => {
    dispatch(actions.addHistory(palettizedData));
  });

  const [state] = result.current;

  expect(state.historyIndex).toEqual(1);
  expect(state.history).toEqual([initialDataMock, palettizedData]);
});

it('should add 4 elements to history', () => {
  const palettizedData = 'NEW HISTORY STATE';
  act(() => {
    dispatch(actions.addHistory(palettizedData));
    dispatch(actions.addHistory(palettizedData));
    dispatch(actions.addHistory(palettizedData));
    dispatch(actions.addHistory(palettizedData));
  });

  const [state] = result.current;

  expect(state.historyIndex).toEqual(4);
  expect(state.history.length).toEqual(5);
});

describe('add in the middle of history', () => {
  beforeEach(() => {
    ({ result } = renderHook(() =>
      useReducer(reducers, ['FIRST ITEM', 'ITEM1', 'ITEM2', 'ITEM3'], init)
    ));
    [, dispatch] = result.current;

    act(() => {
      dispatch(actions.undo());
      dispatch(actions.undo());
      dispatch(actions.undo());
      dispatch(actions.addHistory('NEW ITEM'));
    });
  });

  it('should remove everything after the inserted data', () => {
    const [state] = result.current;
    expect(state.history).toEqual(['FIRST ITEM', 'NEW ITEM']);
  });

  it('should have the index to the inserted data', () => {
    const [state] = result.current;
    expect(state.historyIndex).toEqual(1);
  });
});

describe('undo/redo', () => {
  beforeEach(() => {
    ({ result } = renderHook(() =>
      useReducer(reducers, ['FIRST ITEM', 'ITEM1', 'ITEM2', 'ITEM3'], init)
    ));
    [, dispatch] = result.current;
  });

  it('should handle undo', () => {
    let [state] = result.current;

    expect(selectors.getCurrent(state)).toEqual('ITEM3');

    act(() => {
      dispatch(actions.undo());
    });

    [state] = result.current;

    expect(selectors.getCurrent(state)).toEqual('ITEM2');
  });

  it('should ignore undo when we are at the beginning of the history', () => {
    act(() => {
      dispatch(actions.undo());
      dispatch(actions.undo());
      dispatch(actions.undo());
      dispatch(actions.undo());
    });

    let [state] = result.current;

    expect(selectors.getCurrent(state)).toEqual('FIRST ITEM');
  });

  it('should handle redo', () => {
    act(() => {
      dispatch(actions.undo());
    });

    let [state] = result.current;

    expect(selectors.getCurrent(state)).toEqual('ITEM2');

    act(() => {
      dispatch(actions.redo());
    });

    [state] = result.current;

    expect(selectors.getCurrent(state)).toEqual('ITEM3');
  });

  it('should ignore redo when we are at the end of the history', () => {
    act(() => {
      dispatch(actions.redo());
    });

    let [state] = result.current;

    expect(selectors.getCurrent(state)).toEqual('ITEM3');
  });
});
