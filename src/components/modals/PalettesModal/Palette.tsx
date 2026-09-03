import React from 'react';
import classnames from 'classnames';

import { Color } from '@/types';

import styles from './Palette.module.css';

interface Props {
  colors: Color[];
  onClick: () => void;
  name: string;
  selected: boolean;
}

function Palette({ colors, onClick, name, selected }: Props) {
  return (
    <div
      onClick={onClick}
      className={classnames(styles.root, {
        [styles.selected]: selected,
      })}
    >
      <strong className={styles.title}>{name}</strong>
      <div className={styles.colors}>
        {colors.map((color) => (
          <span
            key={color}
            className={styles.item}
            style={{ background: color }}
          />
        ))}
      </div>
    </div>
  );
}

export default Palette;
