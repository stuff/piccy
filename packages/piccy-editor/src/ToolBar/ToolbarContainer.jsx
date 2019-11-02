import React from 'react';
import { createUseStyles } from 'react-jss';

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
    fontWeight: 'bold'
  }
});

function ToolbarContainer({ title, children }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {title && <span className={classes.title}>{title}</span>}
      {children}
    </div>
  );
}

export default ToolbarContainer;
