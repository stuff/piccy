import React from 'react';

function Palette({ colors, onSelectColor, currentColor }) {
  const clickHandler = e => {
    e.preventDefault();
    const { color } = e.target.dataset;
    const colorIndex = e.type === 'contextmenu' ? 0 : 1;

    onSelectColor(color, colorIndex);
  };
  return (
    <div className="palette">
      {colors.map(color => (
        <div className="palette-item" key={color}>
          <button
            data-color={color}
            className="palette-itemInner"
            style={{ background: color }}
            onClick={clickHandler}
            onContextMenu={clickHandler}
          />
          {color === currentColor ? (
            <span className="palette-selector">▼</span>
          ) : (
            ''
          )}
        </div>
      ))}
    </div>
  );
}

export default Palette;
