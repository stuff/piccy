import react from 'react';
import classnames from 'classnames';
import { FaPlay } from 'react-icons/fa';

import styles from './ToolbarContainer.module.css';

interface Props {
  title?: string;
  onClick?: (id: string) => void;
  children: react.ReactNode;
}

function ToolbarContainer({ title, onClick, children }: Props) {
  const hasConfig = typeof onClick === 'function';

  return (
    <div className={styles.root}>
      {title && (
        <span
          // TODO: harcoded palettes ?
          onClick={hasConfig ? () => onClick('palettes') : () => {}}
          className={classnames(styles.title, {
            [styles.clickable]: hasConfig,
          })}
        >
          {title}
          {hasConfig && <FaPlay className={styles.icon} />}
        </span>
      )}
      {children}
    </div>
  );
}

export default ToolbarContainer;
