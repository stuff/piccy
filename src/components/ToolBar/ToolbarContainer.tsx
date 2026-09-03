import react from 'react';
import classnames from 'classnames';
import { FaPlay } from 'react-icons/fa';

import styles from './ToolbarContainer.module.css';

interface Props {
  title?: string;
  onClick?: (id: string) => void;
  /** Takes the whole width of the toolbar when it sits at the top of the screen. */
  wide?: boolean;
  blackBackground?: boolean;
  fillContent?: boolean;
  fitContentOnMobile?: boolean;
  children: react.ReactNode;
}

function ToolbarContainer({
  title,
  onClick,
  wide,
  blackBackground,
  fillContent,
  fitContentOnMobile,
  children,
}: Props) {
  const hasConfig = typeof onClick === 'function';

  return (
    <div
      className={classnames(styles.root, {
        [styles.wide]: wide,
        [styles.blackBackground]: blackBackground,
        [styles.fillContent]: fillContent,
        [styles.fitContentOnMobile]: fitContentOnMobile,
      })}
    >
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
