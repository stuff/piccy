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
import Signature from './Signature';
import {
  updateUrl,
  getDataForUrlFromImageData,
  getImageUrlFromEditorUrl
} from './helpers/url';
import ToolBar from './ToolBar';

import PalettesModal from './modals/PalettesModal';

const SIZE = 32;
const SCALE = 24;
const SIZE_ARRAY = [SIZE, SIZE];
const ReactHint = ReactHintFactory(React);

const useStyles = createUseStyles(() => {
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
    }
  };
});

function App() {
  const classes = useStyles();
  const [openModal, setOpenModal] = useState(null);
  const [state, dispatch] = useReducer(reducers, [], init);

  const [currentTool, setCurrentTool] = useState('edit');
  const [currentPosition, setCurrenPosition] = useState(null);
  const [hoveringEditor, setHoveringEditor] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [currentColorIndexes, setCurrentColorIndexes] = useState([0, 1]);

  const rawData = selectors.getCurrent(state);

  const getPalettizedData = useMemo(() => {
    if (!rawData) {
      return;
    }

    const hash = shortHash(rawData);

    return { hash, ...services.fromPalettizedData(rawData, SCALE) };
  }, [rawData]);

  const palette = useMemo(() => {
    if (!getPalettizedData) {
      return;
    }

    return services.findPaletteObjectFromColors(getPalettizedData.colors);
  }, [getPalettizedData]);

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
    setCurrentColorIndexes(colors => [colors[1], colors[0]]);
  }, [setCurrentColorIndexes]);

  const handlers = {
    UNDO: undo,
    REDO: redo,
    SWAP_COLOR: swapColor,
    DRAW: () => setCurrentTool('edit'),
    FILL: () => setCurrentTool('fill'),
    PICK: () => setCurrentTool('pick')
  };

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

  const onUpdate = useCallback(
    (dataUrl, imageData) => {
      setFaviconUrl(dataUrl);

      if (!imageData) {
        return;
      }

      const data = getDataForUrlFromImageData(imageData, palette, SIZE, SCALE);

      dispatch(actions.addHistory(data));
    },
    [palette]
  );

  const onSelectColor = useCallback(
    (colorIndex, colorType) => {
      setCurrentColorIndexes(currentColorIndexes => {
        const newCurrentColorIndexes = [...currentColorIndexes];
        newCurrentColorIndexes[colorType] = colorIndex;
        return newCurrentColorIndexes;
      });
    },
    [setCurrentColorIndexes]
  );

  const onCopiedUrl = useCallback(() => {}, []);

  if (!getPalettizedData) {
    return null;
  }

  const currentColors = [
    palette.colors[currentColorIndexes[0]],
    palette.colors[currentColorIndexes[1]]
  ];

  const { colors, hash, imageData } = getPalettizedData;

  return (
    <>
      <GlobalHotKeys keyMap={keymap} handlers={handlers} />

      <Helmet>{faviconUrl && <link rel="icon" href={faviconUrl} />}</Helmet>

      <ReactHint autoPosition events />

      <PalettesModal
        isOpen={openModal === 'palettes'}
        currentPalette={palette}
        onCancel={() => setOpenModal(null)}
        onSelect={palette => {
          setOpenModal(null);
          dispatch(actions.addHistoryChangePalette(rawData, palette));
        }}
      />

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
        onOpenDialog={setOpenModal}
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
          backgroundColor={palette.colors[0]}
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

      <Signature />
    </>
  );
}

export default App;
