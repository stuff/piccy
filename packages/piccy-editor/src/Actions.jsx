import React, { useRef, useState } from 'react';

function Actions({ url, canUndo, onUndo, canRedo, onRedo }) {
  const [justCopied, setJustCopied] = useState(false);

  const textareaElement = useRef(null);
  const onButtonClick = () => {
    textareaElement.current.select();
    document.execCommand('copy');
    setJustCopied(true);
    setTimeout(() => {
      setJustCopied(false);
    }, 1000);
  };

  return (
    <div className="imageurl_copy">
      <textarea
        className="imageurl_copy-textarea  visually-hidden"
        ref={textareaElement}
        value={url}
        readOnly
      />
      <button disabled={!canUndo} onClick={onUndo}>
        Undo
      </button>
      <button disabled={!canRedo} onClick={onRedo}>
        Redo
      </button>
      <button
        disabled={justCopied}
        className="imageurl_copy-button"
        onClick={onButtonClick}
      >
        {justCopied ? 'Copied in clipboard' : 'Copy embeddable url'}
      </button>
    </div>
  );
}

export default Actions;
