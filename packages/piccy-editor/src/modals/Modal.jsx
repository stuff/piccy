import React from 'react';
import { createUseStyles } from 'react-jss';
import ReactModal from 'react-modal';

import { IoIosClose } from 'react-icons/io';

const useStyles = createUseStyles({
  modal: {
    backgroundColor: 'white',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -75%)',
    padding: 32,
    outline: 0
  },

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },

  button: {
    fontSize: '2em',
    padding: 0,
    margin: 0,
    background: 'none',
    border: 'none',
    outline: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    cursor: 'pointer'
  },

  title: {
    position: 'absolute',
    top: -10
  }
});

function Modal({ children, title, onCancel, isOpen, ...props }) {
  const classes = useStyles();

  return (
    <ReactModal
      isOpen={isOpen}
      contentLabel={title}
      className={classes.modal}
      overlayClassName={classes.overlay}
      onRequestClose={onCancel}
    >
      <>
        <h2 className={classes.title}>{title}</h2>
        {children}
        <button className={classes.button} onClick={onCancel}>
          <IoIosClose />
        </button>
      </>
    </ReactModal>
  );
}

export default Modal;
