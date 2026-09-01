import { useEffect } from 'react';

const SELECTOR = 'link[rel="icon"]';

// The editor regenerates the favicon from the canvas on every stroke, so it is
// patched straight onto the document instead of going through React.
export default function useFavicon(href: string | null | undefined) {
  useEffect(() => {
    if (!href) {
      return;
    }

    let link = document.head.querySelector<HTMLLinkElement>(SELECTOR);

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    link.href = href;
  }, [href]);
}
