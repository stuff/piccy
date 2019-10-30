import React, { useMemo } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: { width: 64, display: 'flex', flexWrap: 'wrap' },
  colorItem: { width: 32, height: 32 },
  button: { width: '100%', height: '100%', border: 'none', outline: 'none' }
});

function Palette({ colors, onSelectColor }) {
  const classes = useStyles();

  const clickHandler = e => {
    e.preventDefault();
    const { color } = e.target.dataset;
    const colorIndex = e.type === 'contextmenu' ? 0 : 1;

    onSelectColor(color, colorIndex);
  };

  const sortedColors = useMemo(() => {
    const p = [];
    let c = 0;
    for (let i = 0, l = colors.length; i < l; i += 2) {
      p[i] = colors[c++];
    }
    for (let i = 1, l = colors.length; i < l; i += 2) {
      p[i] = colors[c++];
    }
    return p;
  }, [colors]);

  return (
    <div className={classes.root}>
      {sortedColors.map(color => (
        <div className={classes.colorItem} key={color}>
          <button
            data-color={color}
            className={classes.button}
            style={{ background: color }}
            onClick={clickHandler}
            onContextMenu={clickHandler}
          />
        </div>
      ))}
    </div>
  );
}

export default Palette;
