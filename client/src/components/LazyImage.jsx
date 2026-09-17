import { useState, useRef, useEffect } from 'react';

/**
 * LazyImage — drop-in <img> replacement for product / news / market imagery.
 *
 * Why this exists:
 *  - Native `loading="lazy"` is set so images below the fold aren't requested
 *    during the critical render path.
 *  - `decoding="async"` lets the browser decode off the main thread, avoiding
 *    jank when many images appear at once (e.g. product grids).
 *  - Explicit `width` / `height` (or aspect-ratio CSS) prevent CLS — the
 *    browser reserves space before bytes arrive. If the caller doesn't supply
 *    width/height, we fall back to a CSS aspect-ratio so the layout is stable.
 *  - A subtle fade-in once the image actually decodes avoids the "pop in"
 *    effect while still giving the user immediate feedback that something is
 *    happening.
 *  - `onError` swaps to a graceful placeholder so broken image links don't
 *    produce the broken-image icon.
 *
 * Props:
 *   src        — image URL
 *   alt        — accessibility text (required)
 *   fallback   — placeholder src used when the image errors
 *   aspectRatio — e.g. "4/3". Used as a CSS `aspect-ratio` when no width/height
 *   width / height — numeric pixel values for layout reservation
 *   eager      — set true for above-the-fold imagery (LCP images) to skip
 *                lazy-loading and decoding=async hints.
 *   className / style / rest props — forwarded to the underlying <img>.
 */
const LazyImage = ({
  src,
  alt,
  fallback,
  aspectRatio,
  width,
  height,
  eager = false,
  className = '',
  style,
  onError,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef(null);

  // If the image was cached, the load event may fire before React attaches
  // the listener — check `complete` synchronously on mount so the fade-in
  // doesn't get stuck in the "loading" state for already-cached images.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  // Merge aspect-ratio into inline style so callers can still pass their own.
  const computedStyle = aspectRatio && !width && !height
    ? { ...style, aspectRatio }
    : style;

  const finalSrc = errored && fallback ? fallback : src;

  return (
    <img
      ref={imgRef}
      src={finalSrc}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding={eager ? 'sync' : 'async'}
      // React 18 doesn't recognize `fetchPriority` as a prop — pass it as the
      // lowercase HTML attribute so the browser still receives the hint.
      {...(eager ? { fetchpriority: 'high' } : { fetchpriority: 'auto' })}
      width={width}
      height={height}
      onLoad={() => setLoaded(true)}
      onError={(e) => {
        if (!errored && fallback) {
          setErrored(true);
        }
        if (onError) onError(e);
      }}
      style={{
        ...computedStyle,
        opacity: loaded || errored ? 1 : 0.6,
        transition: 'opacity 240ms ease-out',
      }}
      className={className}
      {...rest}
    />
  );
};

export default LazyImage;
