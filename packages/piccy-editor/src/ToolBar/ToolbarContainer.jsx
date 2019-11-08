import React from 'react';
import classnames from 'classnames';
import { createUseStyles } from 'react-jss';
import { FaPlay } from 'react-icons/fa';

const useStyles = createUseStyles({
  root: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    width: 64,
    marginBottom: 4
  },
  title: {
    background: 'rgba(255, 255, 255, 0.4)',
    display: 'block',
    padding: 2,
    fontSize: '0.8em',
    color: 'black',
    fontWeight: 'bold',
    position: 'relative',
    '&:hover': {
      '& $icon': {
        opacity: 1
      }
    }
  },
  clickable: {
    cursor: 'pointer'
  },
  icon: {
    fontSize: '0.7em',
    position: 'absolute',
    right: 2,
    top: 5,
    opacity: 0.3
  }
});

function ToolbarContainer({ title, onClick, children }) {
  const classes = useStyles();
  const hasConfig = typeof onClick === 'function';

  return (
    <div className={classes.root}>
      {title && (
        <span
          onClick={hasConfig ? () => onClick('palettes') : null}
          className={classnames(classes.title, {
            [classes.clickable]: hasConfig
          })}
        >
          {title}
          {hasConfig && <FaPlay className={classes.icon} />}
        </span>
      )}
      {children}
    </div>
  );
}

export default ToolbarContainer;
