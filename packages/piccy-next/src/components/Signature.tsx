import React from 'react';
import Image from 'next/image';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles(() => {
  const textColor = 'rgba(255, 255, 255, 0.4)';
  return {
    version: {
      textAlign: 'center',
      color: textColor,
      fontSize: '0.8em',
    },

    love: { verticalAlign: '-2px' },

    link: { color: textColor, '&:hover': { color: 'white' } },
  };
});

function Signature() {
  const classes = useStyles();

  return (
    <div className={classes.version}>
      made with{' '}
      <Image
        className={classes.love}
        width="12"
        height="12"
        alt="love"
        src="/image/24/020282c34b13e53f4f4f4ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw0JgjW9LGZyQpcHDgRm22Fua54EmQiQkFnn6VVJ33wZiOkVs7weeGu98eA4V1oiRWcRKFTOk2b3kK2S5XVVr2MzYJY7KUFv33UjJw8TWno24dcRjpzdDWMD7L2wYsubj9T6+fm5aQb7aHmHBoVFBHJGxDkSJcQkpKGBAA"
      />{' '}
      by{' '}
      <a
        className={classes.link}
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.github.com/stuff"
      >
        STuFF
      </a>{' '}
      {new Date().getFullYear()}
    </div>
  );
}

export default Signature;
