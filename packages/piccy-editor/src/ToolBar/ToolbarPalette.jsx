import React, { useMemo } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: { width: 64, display: 'flex', flexWrap: 'wrap' },
  colorItem: { width: 32, height: 32 },
  button: { width: '100%', height: '100%', border: 'none', outline: 'none' }
});

function ToolbarPalette({ colors, onSelectColor }) {
  const classes = useStyles();

  const clickHandler = e => {
    e.preventDefault();
    const { colorindex } = e.target.dataset;
    const colorType = e.type === 'contextmenu' ? 0 : 1;

    onSelectColor(colorindex, colorType);
  };

  const sortedColors = useMemo(() => {
    const p = [];
    let c = 0;
    for (let i = 0, l = colors.length; i < l; i += 2) {
      p[i] = { index: c, color: colors[c++] };
    }
    for (let i = 1, l = colors.length; i < l; i += 2) {
      p[i] = { index: c, color: colors[c++] };
    }
    return p;
  }, [colors]);

  return (
    <div className={classes.root}>
      {sortedColors.map(({ color, index }) => (
        <div className={classes.colorItem} key={color}>
          <button
            data-color={color}
            data-colorindex={index}
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

export default ToolbarPalette;
