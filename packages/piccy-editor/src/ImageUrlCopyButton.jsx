import React, { useRef, useState } from 'react';

function ImageUrlCopyButton({ url }) {
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

export default ImageUrlCopyButton;
