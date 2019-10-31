import React, {
  useState,
  useEffect,
  useReducer,
  useMemo,
  useCallback
} from 'react';
import ReactHintFactory from 'react-hint';
import { createUseStyles } from 'react-jss';
import { Helmet } from 'react-helmet';
import shortHash from 'short-hash';
import keymap from './keymap';
import { GlobalHotKeys } from 'react-hotkeys';

import 'react-hint/css/index.css';

import { palettes, services } from '@stuff/piccy-shared';

import { actions, reducers, init, selectors } from './hooks/editorHistory';
import CanvasElement from './CanvasElement';
import ToolBar from './ToolBar';

const SIZE = 32;
const SCALE = 24;
const SIZE_ARRAY = [SIZE, SIZE];
const ReactHint = ReactHintFactory(React);

const useStyles = createUseStyles({
  '@global': {
    body: {
      margin: 0,
      fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
        sans-serif`,
      '-webkit-font-smoothing': 'antialiased',
      '-moz-osx-font-smoothing': 'grayscale',
      backgroundColor: '#282c34',
      'div[tabindex="-1"]:focus': { outline: 0 }
    },
    '.react-hint__content': { color: 'black', background: 'white' },
    '.react-hint--top:after': { 'border-top-color': 'white' },
    '.react-hint--left:after': { 'border-left-color': 'white' },
    '.react-hint--right:after': { 'border-right-color': 'white' },
    '.react-hint--bottom:after': { 'border-bottom-color': 'white' }
  },

  canvasContainer: {
    border: '1px solid rgba(255, 255, 255, 0.4)',
    margin: '16px auto 16px auto',
    position: 'relative'
  },

  cursor: {
    background: 'white',
    position: 'absolute',
    outline: '1px solid rgba(255, 255, 255, 0.4)',
    border: '1px solid rgba(0, 0, 0, 0.4)',
    pointerEvents: 'none'
  }
});

function App() {
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducers, [], init);

  const [currentColors, setCurrentColors] = useState([
    palettes.sweetie16.colors[0],
    palettes.sweetie16.colors[1]
  ]);

  const [currentTool, setCurrentTool] = useState('edit');
  const [currentPosition, setCurrenPosition] = useState(null);
  const [hoveringEditor, setHoveringEditor] = useState(false);

  const [faviconUrl, setFaviconUrl] = useState(null);

  const undo = useCallback(event => {
    if (event) {
      event.preventDefault(event);
    }
    dispatch(actions.undo());
  }, []);

  const redo = useCallback(event => {
    if (event) {
      event.preventDefault();
    }
    dispatch(actions.redo(event));
  }, []);

  const swapColor = useCallback(() => {
    setCurrentColors(colors => [colors[1], colors[0]]);
  }, [setCurrentColors]);

  const handlers = {
    UNDO: undo,
    REDO: redo,
    SWAP_COLOR: swapColor,
    DRAW: () => setCurrentTool('edit'),
    FILL: () => setCurrentTool('fill'),
    PICK: () => setCurrentTool('pick')
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

  const onSelectColor = useCallback(
    (color, colorType) => {
      setCurrentColors(colors => {
        const newColors = [...colors];
        newColors[colorType] = color;
        return newColors;
      });
    },
    [setCurrentColors]
  );

  const onCopiedUrl = useCallback(() => {}, []);

  if (!getPalettizedData) {
    return null;
  }

  const { colors, hash, imageData } = getPalettizedData;

  return (
    // <HotKeys handlers={handlers} keyMap={keymap}>
    <div>
      <GlobalHotKeys keyMap={keymap} handlers={handlers} />
      <Helmet>{faviconUrl && <link rel="icon" href={faviconUrl} />}</Helmet>
      <ReactHint autoPosition events />
      <ToolBar
        colors={colors}
        currentTool={currentTool}
        currentColor={currentColors[1]}
        currentColors={currentColors}
        onChangeTool={setCurrentTool}
        onSwapColors={swapColor}
        onSelectColor={onSelectColor}
        onUndo={undo}
        canUndo={selectors.canUndo(state)}
        onRedo={redo}
        canRedo={selectors.canRedo(state)}
        onCopiedUrl={onCopiedUrl}
        imageUrl={getImageUrlFromCurrentUrl()}
      />

      <div
        className={classes.canvasContainer}
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
          currentTool={currentTool}
          onMouseMove={onMouseMove}
          onUpdate={onUpdate}
          onSelectColor={onSelectColor}
        />

        {currentPosition &&
          currentPosition[0] > -1 &&
          currentPosition[1] > -1 &&
          hoveringEditor && (
            <div
              className={classes.cursor}
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
    </div>
  );
}

function getImageUrlFromCurrentUrl() {
  const currentUrl = document.location.toString();
  const matcher = /\/edit\//;

  if (!currentUrl.match(matcher)) {
    return;
  }

  return currentUrl.replace(matcher, '/img/24/') + '.png';
}

export default App;
