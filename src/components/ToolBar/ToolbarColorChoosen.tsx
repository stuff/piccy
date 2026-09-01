import React from 'react';
import { FaSync } from 'react-icons/fa';

import styles from './ToolbarColorChoosen.module.css';

interface Props {
  currentColors: [string, string];
  onSwapColors: () => void;
}

function ToolbarColorChoosen({ currentColors, onSwapColors }: Props) {
  return (
    <div
      className={styles.background}
      style={{ background: currentColors[0] }}
    >
      <button
        data-rh="Swap colors"
        className={styles.swap}
        onClick={() => {
          onSwapColors();
        }}
      >
        <FaSync color="white" />
      </button>
      <div
        className={styles.foreground}
        style={{ background: currentColors[1] }}
      />
    </div>
  );
}

export default ToolbarColorChoosen;
