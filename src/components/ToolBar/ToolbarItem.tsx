import React, { useState, useCallback } from 'react';
import classnames from 'classnames';
import { IconType } from 'react-icons';

import styles from './ToolbarItem.module.css';

interface Props {
  id: string;
  tooltip: string;
  Icon: IconType;
  onSelect: (id: string) => void;
  selected?: boolean;
  disabled?: boolean;
}

function ToolbarItem({
  id,
  tooltip,
  Icon,
  onSelect,
  selected,
  disabled,
}: Props) {
  const [feedbackSelected, setFeedbackSelected] = useState(false);

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
      className={classnames(styles.root, {
        [styles.selected]: isSelected,
        [styles.disabled]: disabled,
      })}
    >
      {Icon && React.createElement(Icon, { size: '2em' })}
    </button>
  );
}

export default ToolbarItem;
