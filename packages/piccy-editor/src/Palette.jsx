import React from 'react';

function Palette({ colors, onSelectColor, currentColor }) {
  return (
    <div className="palette">
      {colors.map(color => (
        <div className="palette-item" key={color}>
          <button
            className="palette-itemInner"
            style={{ background: color }}
            onClick={() => {
              onSelectColor(color);
            }}
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
//   background-color: #282c34; ▼
export default Palette;
