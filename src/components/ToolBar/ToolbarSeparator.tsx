import classnames from 'classnames';

import styles from './ToolbarSeparator.module.css';

interface Props {
  verticalOnMobile?: boolean;
}

function ToolbarSeparator({ verticalOnMobile }: Props) {
  return (
    <div
      className={classnames(styles.root, {
        [styles.verticalOnMobile]: verticalOnMobile,
      })}
    />
  );
}

export default ToolbarSeparator;
