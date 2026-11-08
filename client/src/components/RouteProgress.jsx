import { motion } from 'framer-motion';

/**
 * RouteProgress — unobtrusive loading indicator shown while a lazily-loaded
 * route chunk is being fetched.
 *
 * Why this exists instead of a full-page skeleton grid:
 *  - The previous fallback rendered the SAME fake product-card grid for every
 *    route, so opening /login or /about briefly showed a wall of placeholder
 *    product cards that had nothing to do with the page being opened.
 *  - A slim bar pinned to the top edge signals "loading" without occupying
 *    page space or flashing content that does not belong to the destination.
 */
const RouteProgress = () => (
  <div
    className="fixed top-0 left-0 right-0 z-[100] h-0.5 overflow-hidden"
    role="status"
    aria-busy="true"
    aria-live="polite"
  >
    <motion.div
      className="h-full w-full origin-left bg-primary"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    />
    <span className="sr-only">Đang tải trang…</span>
  </div>
);

export default RouteProgress;
