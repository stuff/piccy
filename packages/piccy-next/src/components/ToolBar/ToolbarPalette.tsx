import React, { useMemo } from 'react';
import { createUseStyles } from 'react-jss';

import { Color } from '@/types';

interface Props {
  colors: Color[];
  onSelectColor: (index: number, type: number) => void;
}

const useStyles = createUseStyles({
  root: { width: 64, display: 'flex', flexWrap: 'wrap' },
  colorItem: { width: 32, height: 32 },
  button: { width: '100%', height: '100%', border: 'none', outline: 'none' },
});

function ToolbarPalette({ colors, onSelectColor }: Props) {
  const classes = useStyles();

  const handleColorClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!e.target) {
      return;
    }

    const { colorindex } = (e.target as HTMLButtonElement).dataset;
    const colorType = e.type === 'contextmenu' ? 0 : 1;

    if (!colorindex) {
      return;
    }

    onSelectColor(Number(colorindex), colorType);
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
            onClick={handleColorClick}
            onContextMenu={handleColorClick}
          />
        </div>
      ))}
    </div>
  );
}

export default ToolbarPalette;
