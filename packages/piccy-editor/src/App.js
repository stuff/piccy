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

const useStyles = createUseStyles(() => {
  const textColor = 'rgba(255, 255, 255, 0.4)';
  return {
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
      margin: '16px auto 8px auto',
      right: -32,
      position: 'relative'
    },

    cursor: {
      background: 'white',
      position: 'absolute',
      outline: '1px solid rgba(255, 255, 255, 0.4)',
      border: '1px solid rgba(0, 0, 0, 0.4)',
      pointerEvents: 'none'
    },

    version: {
      textAlign: 'center',
      color: textColor,
      fontSize: '0.8em'
    },

    love: { verticalAlign: '-2px' },

    link: { color: textColor, '&:hover': { color: 'white' } }
  };
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

  const rawData = selectors.getCurrent(state);

  const getPalettizedData = useMemo(() => {
    if (!rawData) {
      return;
    }

    const hash = shortHash(rawData);

    return { hash, ...services.fromPalettizedData(rawData, SCALE) };
  }, [rawData]);

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

  useEffect(() => {
    if (!rawData) {
      return;
    }

    updateUrl(rawData);
  }, [rawData]);

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

    const data = getDataForUrlFromImageData(imageData);

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
    <>
      <GlobalHotKeys keyMap={keymap} handlers={handlers} />
      <Helmet>{faviconUrl && <link rel="icon" href={faviconUrl} />}</Helmet>
      <ReactHint autoPosition events />
      <ToolBar
        colors={colors}
        currentTool={currentTool}
        currentColors={currentColors}
        onChangeTool={setCurrentTool}
        onSwapColors={swapColor}
        onSelectColor={onSelectColor}
        onUndo={undo}
        canUndo={selectors.canUndo(state)}
        onRedo={redo}
        canRedo={selectors.canRedo(state)}
        onCopiedUrl={onCopiedUrl}
        imageUrl={getImageUrlFromEditorUrl()}
        imageData={imageData}
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
      <div className={classes.version}>
        v{process.env.REACT_APP_VERSION} - made with{' '}
        <img
          className={classes.love}
          width="12"
          alt="love"
          src="https://piccy.site/img/24/020282c34b13e53f4f4f4ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw0JgjW9LGZyQpcHDgRm22Fua54EmQiQkFnn6VVJ33wZiOkVs7weeGu98eA4V1oiRWcRKFTOk2b3kK2S5XVVr2MzYJY7KUFv33UjJw8TWno24dcRjpzdDWMD7L2wYsubj9T6+fm5aQb7aHmHBoVFBHJGxDkSJcQkpKGBAA"
        />{' '}
        by{' '}
        <a
          className={classes.link}
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.github.com/stuff"
        >
          STuFF
        </a>{' '}
        2019
      </div>
    </>
  );
}

function updateUrl(dataForUrl) {
  window.history.replaceState(null, null, '/edit/' + dataForUrl);
}

function getDataForUrlFromImageData(imageData) {
  const { smallStr: data } = services.toPalettizedData(
    imageData,
    SIZE,
    SCALE,
    palettes.sweetie16.colors
  );

  return data;
}

function getImageUrlFromEditorUrl() {
  const currentUrl = document.location.toString();
  const matcher = /\/edit\//;

  if (!currentUrl.match(matcher)) {
    return;
  }

  return currentUrl.replace(matcher, '/img/24/');
}

export default App;
