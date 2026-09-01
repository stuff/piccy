'use client';

import * as React from 'react';
import { useState, useEffect, useReducer, useMemo, useCallback } from 'react';

import ReactHintFactory from 'react-hint';
/* @ts-expect-error - short-hash ships no type definitions */
import shortHash from 'short-hash';

import { actions, reducers, init, selectors } from '@/services/editorHistory';

import {
  fromPalettizedData,
  findPaletteObjectFromColors,
  toPalettizedData,
} from '@/services/index2';

import * as palettes from '@/palettes';

import {
  updateUrl,
  getImageStringFromUrl,
  getDataForUrlFromImageData,
  getImageUrlFromEditorUrl,
} from '@/helpers/url';

import keymap from '@/constants/keymap';
import useHotkeys from '@/hooks/useHotkeys';
import useFavicon from '@/hooks/useFavicon';

import PalettesModal from '@/components/modals/PalettesModal';
import ToolBar from '@/components/ToolBar';
import CanvasElement from '@/components/CanvasElement';
import Signature from '@/components/Signature';

import { Point } from '@/types';

import styles from './Editor.module.css';

const SIZE = 32;
const SCALE = 24;
const SIZE_ARRAY: [number, number] = [SIZE, SIZE];

const ReactHint = ReactHintFactory(React);

export default function Editor() {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [state, dispatch] = useReducer(reducers, [], init);
  const [currentTool, setCurrentTool] = useState('edit');
  const [currentPosition, setCurrenPosition] = useState<Point | null>(null);
  const [hoveringEditor, setHoveringEditor] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>();
  const [currentColorIndexes, setCurrentColorIndexes] = useState([0, 1]);
  const rawData = selectors.getCurrent(state);

  useFavicon(faviconUrl);

  const getPalettizedData = useMemo(() => {
    if (!rawData) {
      return;
    }
    const hash = shortHash(rawData);
    return { hash, ...fromPalettizedData(rawData) };
  }, [rawData]);

  const palette = useMemo(() => {
    if (!getPalettizedData) {
      return;
    }
    return findPaletteObjectFromColors(getPalettizedData.colors);
  }, [getPalettizedData]);

  const undo = useCallback(() => {
    dispatch(actions.undo());
  }, []);

  const redo = useCallback(() => {
    dispatch(actions.redo());
  }, []);

  const swapColor = useCallback(() => {
    setCurrentColorIndexes((colors) => [colors[1], colors[0]]);
  }, [setCurrentColorIndexes]);

  useHotkeys(keymap, {
    UNDO: undo,
    REDO: redo,
    SWAP_COLOR: swapColor,
    DRAW: () => setCurrentTool('edit'),
    FILL: () => setCurrentTool('fill'),
    PICK: () => setCurrentTool('pick'),
  });

  useEffect(() => {
    let data;
    const imageFromUrl = getImageStringFromUrl();

    if (imageFromUrl) {
      data = imageFromUrl;
    } else {
      const { smallStr } = toPalettizedData(
        null,
        SIZE,
        SCALE,
        palettes.sweetie16.colors
      );

      data = smallStr;
    }

    dispatch(actions.addHistory(data));
  }, []);

  useEffect(() => {
    if (!rawData) {
      return;
    }
    updateUrl(rawData);
  }, [rawData]);

  const handleMouseMove = useCallback(
    ([x, y]: Point) =>
      setCurrenPosition([Math.floor(x / SCALE), Math.floor(y / SCALE)]),
    []
  );

  const handleUpdateDrawing = useCallback(
    (dataUrl: string, imageData?: ImageData) => {
      setFaviconUrl(dataUrl);
      if (!imageData || !palette) {
        return;
      }
      const data = getDataForUrlFromImageData(imageData, palette, SIZE, SCALE);
      dispatch(actions.addHistory(data));
    },
    [palette]
  );

  const handleColorSelectByIndex = useCallback(
    (index: number, type: number) => {
      setCurrentColorIndexes((currentColorIndexes) => {
        const newCurrentColorIndexes = [...currentColorIndexes];
        newCurrentColorIndexes[type] = index;
        return newCurrentColorIndexes;
      });
    },
    [setCurrentColorIndexes]
  );

  const handleColorSelect = useCallback(
    (color: string, type: number) => {
      const index = palette?.colors.findIndex((c) => c === color);

      if (!index) {
        return;
      }

      setCurrentColorIndexes((currentColorIndexes) => {
        const newCurrentColorIndexes = [...currentColorIndexes];
        newCurrentColorIndexes[type] = index;
        return newCurrentColorIndexes;
      });
    },
    [palette?.colors]
  );

  const handleCopiedUrl = useCallback(() => {
    navigator.clipboard.writeText(getImageUrlFromEditorUrl());
  }, []);

  if (!getPalettizedData || !palette) {
    return null;
  }

  const currentColors: [string, string] = [
    palette.colors[currentColorIndexes[0]],
    palette.colors[currentColorIndexes[1]],
  ];

  const { hash, imageData } = getPalettizedData;

  return (
    <>
      <ReactHint autoPosition events />

      <PalettesModal
        isOpen={openModal === 'palettes'}
        currentPalette={palette}
        onCancel={() => setOpenModal(null)}
        onSelect={(palette) => {
          setOpenModal(null);
          dispatch(actions.addHistoryChangePalette(rawData, palette));
        }}
      />

      <ToolBar
        colors={palette.colors}
        currentTool={currentTool}
        currentColors={currentColors}
        onChangeTool={(id) => setCurrentTool(id)}
        onSwapColors={swapColor}
        onSelectColor={handleColorSelectByIndex}
        onUndo={undo}
        canUndo={selectors.canUndo(state)}
        onRedo={redo}
        canRedo={selectors.canRedo(state)}
        onCopiedUrl={handleCopiedUrl}
        // imageUrl={getImageUrlFromEditorUrl()} // TODO
        imageUrl=""
        imageData={imageData}
        onOpenDialog={(modalId: string) => {
          setOpenModal(modalId);
        }}
      />
      <div
        className={styles.canvasContainer}
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
          onMouseMove={handleMouseMove}
          onUpdate={handleUpdateDrawing}
          onSelectColor={handleColorSelect}
        />
        {currentPosition &&
          currentPosition[0] > -1 &&
          currentPosition[1] > -1 &&
          hoveringEditor && (
            <div
              className={styles.cursor}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0)',
                left: currentPosition[0] * SCALE,
                top: currentPosition[1] * SCALE,
                width: SCALE,
                height: SCALE,
              }}
            />
          )}
      </div>
      <Signature />
    </>
  );
}
