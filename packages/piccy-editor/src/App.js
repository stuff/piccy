import React, { useState, useEffect } from 'react';
import './App.css';

import { palettes, services } from '@stuff/piccy-shared';
import Palette from './Palette';
import CurrentColor from './CurrentColor';
import CanvasElement from './CanvasElement';
import ImageUrlCopyButton from './ImageUrlCopyButton';

const SIZE = 32;
const SCALE = 24;

function App() {
  const [initData, setInitData] = useState(null);
  const [colors, setColors] = useState(palettes.sweetie16.colors);
  const [initialImageData, setInitialImageData] = useState(null);

  const [currentColor, setCurrentColor] = useState(
    palettes.sweetie16.colors[0]
  );

  const [currentPosition, setCurrenPosition] = useState(null);

  useEffect(() => {
    const [, data] = document.location.pathname.match(/\/edit\/(.*)/) || [];
    if (data) {
      const { colors, imageData } = services.fromPalettizedData(data, SCALE);

      setColors(colors);
      setInitialImageData(imageData);
      setInitData(data);
    }
  }, []);

  return (
    <div className="App">
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
          key={initData}
          initialImageData={initialImageData}
          size={[SIZE, SIZE]}
          scale={SCALE}
          backgroundColor={palettes.sweetie16.colors[0]}
          currentColor={currentColor}
          onMouseMove={([x, y]) =>
            setCurrenPosition([Math.floor(x / SCALE), Math.floor(y / SCALE)])
          }
          onUpdate={imageData => {
            const { smallStr } = services.toPalettizedData(
              imageData,
              SIZE,
              SCALE,
              palettes.sweetie16
            );

            window.history.replaceState(null, null, '/edit/' + smallStr);
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
      <ImageUrlCopyButton url={getImageUrlFromCurrentUrl()} />
    </div>
  );
}

function getImageUrlFromCurrentUrl() {
  const currentUrl = document.location.toString();
  const matcher = /\/edit\//;

  if (!currentUrl.match(matcher)) {
    return;
  }

  return currentUrl.replace(matcher, '/img/');
}

export default App;
