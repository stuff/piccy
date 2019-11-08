import React from 'react';
import classnames from 'classnames';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: { cursor: 'pointer', margin: [8, 0], padding: [8, 0] },
  item: {
    width: 32,
    height: 32,
    display: 'inline-block',
    outline: '1px solid white'
  },
  title: { display: 'block', marginBottom: 8 },
  selected: {
    background: '#b4b4b4',
    '&$root': {
      marginLeft: -32,
      marginRight: -32,
      paddingLeft: 32
    },
    '& $item': {
      outline: '1px solid #b4b4b4'
    }
  }
});

function Palette({ colors, onClick, name, selected }) {
  const classes = useStyles();

  return (
    <div
      onClick={onClick}
      className={classnames(classes.root, {
        [classes.selected]: selected
      })}
    >
      <strong className={classes.title}>{name}</strong>
      <>
        {colors.map(color => (
          <span
            key={color}
            className={classes.item}
            style={{ background: color }}
          />
        ))}
      </>
    </div>
  );
}

export default Palette;
