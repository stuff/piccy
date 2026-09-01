import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: { height: '4px', background: '#282c34' }
});

function ToolbarSeparator() {
  const classes = useStyles();

  return <div className={classes.root} />;
}

export default ToolbarSeparator;
