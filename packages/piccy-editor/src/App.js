import React, {
  useState,
  useEffect,
  useReducer,
  useMemo,
  useCallback
} from 'react';
import { Helmet } from 'react-helmet';
import shortHash from 'short-hash';
import keymap from './keymap';
import { HotKeys } from 'react-hotkeys';

import './App.css';

import { palettes, services } from '@stuff/piccy-shared';

import { actions, reducers, init, selectors } from './hooks/editorHistory';
import Palette from './Palette';
import CurrentColor from './CurrentColor';
import CanvasElement from './CanvasElement';
import Actions from './Actions';

const SIZE = 32;
const SCALE = 24;
const SIZE_ARRAY = [SIZE, SIZE];

function App() {
  const [state, dispatch] = useReducer(reducers, [], init);

  const [currentColors, setCurrentColors] = useState([
    palettes.sweetie16.colors[0],
    palettes.sweetie16.colors[1]
  ]);

  const [currentPosition, setCurrenPosition] = useState(null);
  const [hoveringEditor, setHoveringEditor] = useState(false);

  const [faviconUrl, setFaviconUrl] = useState(null);

  const undo = React.useCallback(event => {
    event.preventDefault(event);
    dispatch(actions.undo());
  }, []);

  const redo = React.useCallback(event => {
    event.preventDefault();
    dispatch(actions.redo(event));
  }, []);

  const handlers = {
    UNDO: undo,
    REDO: redo
  };

  const getPalettizedData = useMemo(() => {
    const rawData = selectors.getCurrent(state);
    if (!rawData) {
      return;
    }
    const hash = shortHash(rawData /*+ Math.random()*/);

    return { hash, ...services.fromPalettizedData(rawData, SCALE) };
  }, [state]);

  useEffect(() => {
    const urlMatch = document.location.pathname.match(/\/edit\/(.*)/);
    let data;

    // init from url
    if (urlMatch) {
      [, data] = urlMatch;

      // init from blank
    } else {
      ({ smallStr: data } = services.toPalettizedData(
        null,
        SIZE,
        SCALE,
        palettes.sweetie16.colors
      ));
    }

    dispatch(actions.addHistory(data));
  }, []);

  const onMouseMove = useCallback(
    ([x, y]) =>
      setCurrenPosition([Math.floor(x / SCALE), Math.floor(y / SCALE)]),
    []
  );

  const onUpdate = useCallback((dataUrl, imageData) => {
    setFaviconUrl(dataUrl);

    if (!imageData) {
      return;
    }

    const { smallStr: data } = services.toPalettizedData(
      imageData,
      SIZE,
      SCALE,
      palettes.sweetie16.colors
    );

    window.history.replaceState(null, null, '/edit/' + data);

    dispatch(actions.addHistory(data));
  }, []);

  if (!getPalettizedData) {
    return null;
  }

  const { colors, hash, imageData, size } = getPalettizedData;

  return (
    <HotKeys handlers={handlers} keyMap={keymap}>
      <div className="App">
        <Helmet>{faviconUrl && <link rel="icon" href={faviconUrl} />}</Helmet>
        {/* <div style={{ color: 'white' }}>
        {history.length}
        {canvasKey}
      </div> */}
        <Palette
          colors={colors}
          currentColor={currentColors[1]}
          onSelectColor={(color, colorType) => {
            setCurrentColors(colors => {
              const newColors = [...colors];
              newColors[colorType] = color;
              return newColors;
            });
          }}
        />
        <CurrentColor color={currentColors[1]} />
        <CurrentColor color={currentColors[0]} />
        {/* {currentPosition && (
        <div style={{ color: 'white' }}>
          {currentPosition[0]}, {currentPosition[1]}
        </div>
      )} */}
        <div
          className="canvas_container"
          style={{ width: SIZE * SCALE }}
          onMouseEnter={() => setHoveringEditor(true)}
          onMouseLeave={() => setHoveringEditor(false)}
        >
          <CanvasElement
            key={hash}
            initialImageData={imageData}
            size={SIZE_ARRAY}
            scale={SCALE}
            backgroundColor={palettes.sweetie16.colors[0]}
            currentColors={currentColors}
            onMouseMove={onMouseMove}
            onUpdate={onUpdate}
          />

          {currentPosition &&
            currentPosition[0] > -1 &&
            currentPosition[1] > -1 &&
            hoveringEditor && (
              <div
                className="canvas_container-cursor"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  left: currentPosition[0] * SCALE,
                  top: currentPosition[1] * SCALE,
                  width: SCALE,
                  height: SCALE
                }}
              />
            )}
        </div>
        <Actions
          onUndo={undo}
          canUndo={selectors.canUndo(state)}
          onRedo={redo}
          canRedo={selectors.canRedo(state)}
          url={getImageUrlFromCurrentUrl()}
        />
      </div>
    </HotKeys>
  );
}

function getImageUrlFromCurrentUrl() {
  const currentUrl = document.location.toString();
  const matcher = /\/edit\//;

  if (!currentUrl.match(matcher)) {
    return;
  }

  return currentUrl.replace(matcher, '/img/24/');
}

export default App;
