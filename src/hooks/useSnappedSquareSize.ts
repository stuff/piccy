import { useCallback, useEffect, useState } from 'react';

interface Options {
  /** Number of image pixels along one side. */
  cells: number;
  /** Size below which the page scrolls rather than shrink any further. */
  minSize: number;
  /** Natural size, never exceeded. */
  maxSize: number;
  /** Space to leave free below the square. */
  reservedHeight: number;
}

/**
 * Measures the space available inside the returned ref and gives back the side
 * of the largest square that fits, snapped down to a whole multiple of `cells`.
 *
 * Snapping matters: the canvas keeps its full internal resolution and is only
 * scaled down by CSS, so a size that is not a multiple of the image size would
 * spread the image pixels over an uneven number of screen pixels and make them
 * look ragged.
 */
export default function useSnappedSquareSize({
  cells,
  minSize,
  maxSize,
  reservedHeight,
}: Options) {
  // A callback ref rather than `useRef`: the element only shows up once the
  // editor has something to draw, which is several renders after mount.
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState(maxSize);

  const ref = useCallback((element: HTMLDivElement | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!node) {
      return;
    }

    const measure = () => {
      // `offsetTop` (and not the bounding rect) so the value does not move with
      // the page scroll and feed back into the size we are about to set.
      const availableHeight =
        window.innerHeight - node.offsetTop - reservedHeight;

      const available = Math.min(
        node.clientWidth,
        Math.max(availableHeight, minSize)
      );

      const snapped = Math.floor(available / cells) * cells;

      setSize(Math.min(Math.max(snapped, cells), maxSize));
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(node);

    // The parent tells us when the toolbar above wraps to another row and
    // pushes us down.
    if (node.parentElement) {
      observer.observe(node.parentElement);
    }

    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [node, cells, minSize, maxSize, reservedHeight]);

  return [ref, size] as const;
}
