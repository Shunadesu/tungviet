/**
 * PageFallback — Suspense placeholder shown while a route chunk loads.
 *
 * Designed to match the visual rhythm of the rest of the site (max-w-7xl
 * container + page-hero style block) so transitions feel intentional rather
 * than jarring. Uses `aria-busy` so assistive tech announces the pending
 * navigation.
 */
import Skeleton from './Skeleton';

const PageFallback = () => (
  <div
    role="status"
    aria-busy="true"
    aria-live="polite"
    className="min-h-[60vh] flex flex-col"
  >
    <div className="bg-gradient-to-br from-primary-50/40 via-white to-primary-50/30 pt-10 pb-12 md:pt-16 md:pb-20">
      <div className="container-page">
        <Skeleton variant="text" width={140} height={14} className="mb-6" />
        <Skeleton variant="rect" width="60%" height={48} rounded className="mb-4" />
        <Skeleton variant="rect" width="40%" height={20} rounded />
      </div>
    </div>
    <div className="container-page py-12 md:py-16 flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="card p-0 overflow-hidden border border-gray-100"
          >
            <Skeleton variant="rect" width="100%" height={180} />
            <div className="p-4 space-y-3">
              <Skeleton variant="text" width="80%" height={16} />
              <Skeleton variant="text" width="50%" height={12} />
              <Skeleton variant="text" width="90%" height={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
    <span className="sr-only">Loading page content…</span>
  </div>
);

export default PageFallback;
