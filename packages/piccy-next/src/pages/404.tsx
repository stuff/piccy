import { createUseStyles } from 'react-jss';
import Image from 'next/image';
import Head from 'next/head';

const useStyles = createUseStyles({
  '@global': {
    h1: {
      opacity: '0.3',
    },
    'body > div': {
      display: 'grid',
      height: '60vh',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
    },
  },
  container: {
    textAlign: 'center',
  },

  images: {
    display: 'flex',
    gap: '16px',
  },
});

export default function Custom404() {
  const classes = useStyles();

  return (
    <>
      <Head>
        <link
          rel="icon"
          href="/image/24/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXQjDBMil2leBmdAWHu9-Xmg23zPJ3XFNxsOAUwt3EpqyMnfyrCycqoY3FmG6dYFCSHwxUIEf2p458+DyWtc0tOV5ja84Oyb7Q6wagu1sOmaN0EHynNG6ZsZg64iKBxUUY-PCtmMK9fML0jYyjaO2g8IiDMeFUYkBgCDKNrHxy3Wk0CriKsEsg8wwrQLJ5sGsy9Txqq8gTUUkI4BAx4oA"
        />
        <title>Page Not Found</title>
      </Head>

      <div className={classes.container}>
        <h1>Page Not Found</h1>
        <div className={classes.images}>
          <Image
            alt="4"
            width="160"
            height="160"
            src="/image/10/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTuwJnJ4DGbnLVjCvp9HigYXiVEeZJVePGbWPVoo6Hq28DV8-pPU5wGFfrjEQ+mNEMnYkLGCNgdSE6HyLxOylUX08kmgya0xtpyyll6rMnKotmMmru0VvXb7vO-BtQA"
          />
          <Image
            alt="0"
            width="160"
            height="160"
            src="/image/10/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTuwJgY2c+86xVl6MWwcnmIaccIWmRgbiEtndAylC4k1NtAZlj7WZZOoYTgGtI-CpKnj8s6RHYilwFiPVqQ2jZD0lZoA+GGGiy+aaPbRV84jsXL9px3ZCjYdrYeOuvJ5e3oxBqDCh+oIRkeo+wS6k1HDxSf7EqYHk9Ema2WgF8EA"
          />
          <Image
            alt="4"
            width="160"
            height="160"
            src="/image/10/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTuwJnJ4DGbnLVjCvp9HigYXiVEeZJVePGbWPVoo6Hq28DV8-pPU5wGFfrjEQ+mNEMnYkLGCNgdSE6HyLxOylUX08kmgya0xtpyyll6rMnKotmMmru0VvXb7vO-BtQA"
          />
        </div>
      </div>
    </>
  );
}
