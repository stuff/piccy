import React from 'react';
import ReactModal from 'react-modal';

import { IoIosClose } from 'react-icons/io';

import styles from './Modal.module.css';

interface Props {
  children?: React.ReactNode;
  title: string;
  onCancel: () => void;
  isOpen: boolean;
}

function Modal({ children, title, onCancel, isOpen }: Props) {
  const appElement =
    typeof document === 'undefined'
      ? undefined
      : (document.getElementById('app-root') ?? undefined);

  return (
    <ReactModal
      isOpen={isOpen}
      appElement={appElement}
      contentLabel={title}
      className={styles.modal}
      overlayClassName={styles.overlay}
      onRequestClose={onCancel}
    >
      <>
        <h2 className={styles.title}>{title}</h2>
        {children}
        <button className={styles.button} onClick={onCancel}>
          <IoIosClose />
        </button>
      </>
    </ReactModal>
  );
}

export default Modal;
