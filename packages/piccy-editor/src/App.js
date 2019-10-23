import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import shortHash from 'short-hash';

import './App.css';

import { palettes, services } from '@stuff/piccy-shared';

import Palette from './Palette';
import CurrentColor from './CurrentColor';
import CanvasElement from './CanvasElement';
import Actions from './Actions';

const SIZE = 32;
const SCALE = 24;

function App() {
  const [canvasKey, setCanvasKey] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [initialImageData, setInitialImageData] = useState(null);

  const [colors, setColors] = useState(palettes.sweetie16.colors);
  const [currentColor, setCurrentColor] = useState(
    palettes.sweetie16.colors[0]
  );

  const [currentPosition, setCurrenPosition] = useState(null);

  const [faviconUrl, setFaviconUrl] = useState(null);

  useEffect(() => {
    const urlMatch = document.location.pathname.match(/\/edit\/(.*)/);
    let data;

    // init from url
    if (urlMatch) {
      [, data] = urlMatch;
      const { colors, imageData } = services.fromPalettizedData(data);

      setColors(colors);
      setInitialImageData(imageData);
      setCanvasKey(shortHash(data + Math.random()));

      // init from blank
    } else {
      ({ smallStr: data } = services.toPalettizedData(
        null,
        SIZE,
        SCALE,
        palettes.sweetie16.colors
      ));
    }

    setHistory(history => [data, ...history]);
  }, []);

  return (
    <div className="App">
      <Helmet>{faviconUrl && <link rel="icon" href={faviconUrl} />}</Helmet>
      {/* <div style={{ color: 'white' }}>
        {history.length}
        {canvasKey}
      </div> */}
      <Palette
        colors={colors}
        currentColor={currentColor}
        onSelectColor={setCurrentColor}
      />
      <CurrentColor color={currentColor} />
      {/* {currentPosition && (
        <div style={{ color: 'white' }}>
          {currentPosition[0]}, {currentPosition[1]}
        </div>
      )} */}
      <div className="canvas_container" style={{ width: SIZE * SCALE }}>
        <CanvasElement
          key={canvasKey}
          initialImageData={initialImageData}
          size={[SIZE, SIZE]}
          scale={SCALE}
          backgroundColor={palettes.sweetie16.colors[0]}
          currentColor={currentColor}
          onMouseMove={([x, y]) =>
            setCurrenPosition([Math.floor(x / SCALE), Math.floor(y / SCALE)])
          }
          onUpdate={(dataUrl, imageData) => {
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

            setHistory(history => [data, ...history]);
          }}
        />

        {currentPosition && currentPosition[0] > -1 && currentPosition[1] > -1 && (
          <div
            className="canvas_container-cursor"
            style={{
              backgroundColor: currentColor,
              left: currentPosition[0] * SCALE,
              top: currentPosition[1] * SCALE,
              width: SCALE,
              height: SCALE
            }}
          />
        )}
      </div>
      <Actions
        onUndo={() => {
          const newIndex = historyIndex + 1;
          const data = history[newIndex];

          const { colors, imageData } = services.fromPalettizedData(
            data,
            SCALE
          );

          setColors(colors);
          setInitialImageData(imageData);

          setCanvasKey(shortHash(data + Math.random()));

          setHistoryIndex(newIndex);

          window.history.replaceState(null, null, '/edit/' + data);
        }}
        undo={history.length - 1 - historyIndex}
        url={getImageUrlFromCurrentUrl()}
      />
    </div>
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
