import React, { useState, useCallback } from 'react';
import { createUseStyles } from 'react-jss';
import classnames from 'classnames';

const useStyles = createUseStyles({
  root: {
    height: 32,
    width: 32,
    background: 'black',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0,
    color: 'white',
    '& > *': { opacity: 0.15 }
  },
  selected: {
    background: ['#555', '!important'],
    color: 'black',
    '& > *': { opacity: 1 }
  },
  disabled: {
    background: 'black',
    '& > *': { opacity: 0.08 }
  }
});

function ToolbarItem({ id, tooltip, Icon, onSelect, selected, disabled }) {
  const [feedbackSelected, setFeedbackSelected] = useState(false);
  const classes = useStyles();

  const onVisualFeedbackClick = useCallback(() => {
    setFeedbackSelected(true);
    const t = setTimeout(() => {
      setFeedbackSelected(false);
    }, 150);
    return () => {
      clearTimeout(t);
    };
  }, []);

  const isSelected = selected || feedbackSelected;

  return (
    <button
      data-rh={tooltip}
      onClick={() => {
        if (selected === undefined) {
          onVisualFeedbackClick();
        }
        onSelect(id);
      }}
      className={classnames(classes.root, {
        [classes.selected]: isSelected,
        [classes.disabled]: disabled
      })}
    >
      {Icon && React.createElement(Icon, { size: '2em' })}
    </button>
  );
}

export default ToolbarItem;
