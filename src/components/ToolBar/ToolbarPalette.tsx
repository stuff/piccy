import React from 'react';

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

  // The swatches are laid out in document order: eight per row on mobile, and
  // top-to-bottom in two columns on desktop (see the stylesheet).
  return (
    <div className={styles.root}>
      {colors.map((color, index) => (
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
