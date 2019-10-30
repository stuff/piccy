import React from 'react';
import { createUseStyles } from 'react-jss';
import { FaSync } from 'react-icons/fa';

const useStyles = createUseStyles({
  background: {
    position: 'relative',
    display: 'flex',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center'
  },
  foreground: { width: 32, height: 32 },
  swap: {
    position: 'absolute',
    right: 0,
    top: 0,
    background: 'black',
    border: 'none',
    outline: 'none',
    padding: 2,
    margin: 0
  }
});

function PaletteColorChoosen({ currentColors, onSwapColors }) {
  const classes = useStyles();
  return (
    <div
      className={classes.background}
      style={{ background: currentColors[0] }}
    >
      <button
        data-rh="Swap colors"
        className={classes.swap}
        onClick={() => {
          onSwapColors();
        }}
      >
        <FaSync color="white" />
      </button>
      <div
        className={classes.foreground}
        style={{ background: currentColors[1] }}
      />
    </div>
  );
}

export default PaletteColorChoosen;
