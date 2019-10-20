import React from 'react';

function CurrentColor({ color }) {
  return (
    <div className="current-color" style={{ backgroundColor: color }}></div>
  );
}

export default CurrentColor;
