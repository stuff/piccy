import { useCallback, useLayoutEffect, useState } from 'react';

interface Options {
  /** Number of image pixels along one side. */
  cells: number;
  /** Size below which the page scrolls rather than shrink any further. */
  minSize: number;
  /** Natural size, never exceeded. */
  maxSize: number;
  /** Space to leave free below the square. */
  reservedHeight: number;
  /** Parent CSS property used by content whose height depends on the square. */
  sizeCssVariable?: `--${string}`;
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
  sizeCssVariable,
}: Options) {
  // A callback ref rather than `useRef`: the element only shows up once the
  // editor has something to draw, which is several renders after mount.
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState(maxSize);

  const ref = useCallback((element: HTMLDivElement | null) => {
    setNode(element);
  }, []);

  useLayoutEffect(() => {
    if (!node) {
      return;
    }

    const measure = () => {
      const sizeTarget = sizeCssVariable ? node.parentElement : null;
      const largestCandidate =
        Math.floor(Math.min(node.clientWidth, maxSize) / cells) * cells;
      let nextSize = cells;

      // Test each snapped size against the layout it produces. This avoids a
      // feedback loop when content above the square also uses its width.
      for (
        let candidate = Math.max(largestCandidate, cells);
        candidate >= cells;
        candidate -= cells
      ) {
        if (sizeTarget && sizeCssVariable) {
          sizeTarget.style.setProperty(sizeCssVariable, `${candidate}px`);
        }

        // `offsetTop` (and not the bounding rect) keeps scrolling out of the
        // calculation while reflecting the candidate's dependent layout.
        const availableHeight =
          window.innerHeight - node.offsetTop - reservedHeight;

        if (candidate <= Math.max(availableHeight, minSize)) {
          nextSize = candidate;
          break;
        }
      }

      if (sizeTarget && sizeCssVariable) {
        sizeTarget.style.setProperty(sizeCssVariable, `${nextSize}px`);
      }
      setSize(nextSize);
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(node);

    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [
    node,
    cells,
    minSize,
    maxSize,
    reservedHeight,
    sizeCssVariable,
  ]);

  return [ref, size] as const;
}
