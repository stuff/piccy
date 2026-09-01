import React, { useMemo } from 'react';

import { Color } from '@/types';

import styles from './ToolbarPalette.module.css';

interface Props {
  colors: Color[];
  onSelectColor: (index: number, type: number) => void;
}

function ToolbarPalette({ colors, onSelectColor }: Props) {
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
    <div className={styles.root}>
      {sortedColors.map(({ color, index }) => (
        <div className={styles.colorItem} key={color}>
          <button
            data-color={color}
            data-colorindex={index}
            className={styles.button}
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
