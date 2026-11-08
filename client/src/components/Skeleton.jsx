const baseShimmer =
  'relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.6s_ease-in-out_infinite]';

/**
 * Skeleton building block.
 * Variants:
 *   - text   (default): inline rectangle suited for lines of copy
 *   - rect                : generic rectangle (use width/height)
 *   - circle              : round avatar / icon placeholder
 *   - card                : rounded block with light border for tiles
 *
 * Pass `width` / `height` (numbers = px, strings pass through). Combine with
 * `className` for spacing.
 */
const Skeleton = ({ variant = 'text', width, height, className = '', style = {}, rounded = false }) => {
  const sizeStyle = {
    width: width || undefined,
    height: height || undefined,
    ...style,
  };

  const commonCls = `${baseShimmer} inline-block ${className}`;

  if (variant === 'circle') {
    return (
      <span
        className={`${commonCls} rounded-full`}
        style={{
          width: width || height || 40,
          height: height || width || 40,
        }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'rect') {
    return <span className={`${commonCls} rounded ${rounded ? 'rounded-full' : ''}`} style={sizeStyle} aria-hidden="true" />;
  }

  if (variant === 'card') {
    return (
      <span
        className={`${commonCls} rounded-xl border border-gray-200 ${rounded ? 'rounded-full' : ''}`}
        style={sizeStyle}
        aria-hidden="true"
      />
    );
  }

  // text variant default
  return (
    <span
      className={`${commonCls} rounded h-3`}
      style={sizeStyle}
      aria-hidden="true"
    />
  );
};

Skeleton.Group = ({ children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>{children}</div>
);

/**
 * Skeleton card grid for product/market listing pages.
 * Renders `cols` cards x `rows` rows. Uses a card-like block per item.
 */
Skeleton.CardGrid = ({ rows = 2, cols = 4, gap = 'gap-3 md:gap-4', className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gap} ${className}`}>
    {Array.from({ length: rows * cols }).map((_, idx) => (
      <div key={idx} className="space-y-3">
        <Skeleton variant="rect" height={140} width="100%" className="rounded-xl" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" />
      </div>
    ))}
  </div>
);

/**
 * Skeleton for the Markets listing page (filter bar + wide-image cards).
 * The hero is rendered by the page itself so SEO metadata stays visible.
 */
Skeleton.Markets = ({ cards = 6 }) => (
  <div aria-busy="true">
    {/* Filter bar */}
    <div className="flex items-center gap-2.5 flex-wrap mb-6">
      <Skeleton variant="rect" width={180} height={40} className="rounded-xl" />
      <Skeleton variant="rect" width={130} height={40} className="rounded-xl" />
      <Skeleton variant="rect" width={140} height={40} className="rounded-xl" />
      <Skeleton variant="rect" width={150} height={40} className="rounded-xl" />
      <Skeleton variant="rect" width={220} height={40} className="rounded-xl" />
    </div>

    {/* Card grid — wide image on top */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {Array.from({ length: cards }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden flex flex-col"
        >
          <div className="aspect-[16/9] bg-gray-100 animate-pulse flex-shrink-0" />
          <div className="p-4 space-y-3">
            <Skeleton variant="text" width="70%" height={14} />
            <Skeleton variant="text" width="40%" height={10} />
            <Skeleton variant="text" width="100%" height={10} />
            <Skeleton variant="text" width="85%" height={10} />
            <div className="pt-3 border-t border-gray-100 flex items-center gap-2.5">
              <Skeleton variant="rect" width="100%" height={36} className="rounded-lg" />
              <Skeleton variant="rect" width="100%" height={36} className="rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for MarketDetail page (hero + tabs + content).
 */
Skeleton.MarketDetail = () => (
  <div className="pb-24 md:pb-28" aria-busy="true">
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50/50" />
      <div className="relative container-page py-8 md:py-10 lg:py-12">
        <Skeleton variant="text" width={220} height={12} className="mb-3" />
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="80%" height={32} className="mt-3" />
        <Skeleton variant="text" width="50%" height={16} className="mt-3" />
      </div>
    </div>
    <div className="container-page -mt-4 mb-6">
      <Skeleton variant="rect" width="100%" height={220} className="rounded-xl" />
    </div>
    <div className="container-page">
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} variant="rect" width={120} height={36} className="rounded-lg" />
        ))}
      </div>
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="92%" />
      <Skeleton variant="text" width="88%" className="mt-2" />
      <Skeleton variant="rect" width="100%" height={120} className="rounded-2xl mt-6" />
    </div>
  </div>
);

/**
 * Skeleton for ProductDetail page (gallery + info columns).
 */
Skeleton.ProductDetail = () => (
  <div className="container-page py-12 md:py-16 pb-24 md:pb-16" aria-busy="true">
    <Skeleton variant="text" width={220} height={12} className="mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
      <div className="lg:col-span-3 space-y-3">
        <Skeleton variant="rect" width="100%" height={420} className="rounded-2xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} variant="rect" width={80} height={80} className="rounded-lg" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 space-y-4">
        <Skeleton variant="rect" width="100%" height={140} className="rounded-2xl" />
        <Skeleton variant="rect" width="100%" height={200} className="rounded-2xl" />
        <Skeleton variant="rect" width="100%" height={160} className="rounded-2xl" />
        <Skeleton variant="rect" width="100%" height={56} className="rounded-xl" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for NewsDetail page (hero image + meta + content + sidebar).
 */
Skeleton.NewsDetail = () => (
  <div className="max-w-6xl mx-auto px-4 py-8" aria-busy="true">
    <Skeleton variant="text" width={260} height={12} className="mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton variant="rect" width="100%" height={320} className="rounded-xl" />
        <div className="flex items-center gap-3">
          <Skeleton variant="rect" width={80} height={24} className="rounded-full" />
          <Skeleton variant="text" width={140} height={14} />
        </div>
        <Skeleton variant="text" width="85%" height={28} />
        <div className="space-y-2 pt-2">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="96%" />
          <Skeleton variant="text" width="92%" />
          <Skeleton variant="text" width="88%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
      <div className="lg:col-span-1">
        <Skeleton variant="rect" width="100%" height={360} className="rounded-2xl" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for generic PageHero.
 */
Skeleton.PageHero = () => (
  <div className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50/50" />
    <div className="relative container-page py-8 md:py-10 lg:py-12">
      <Skeleton variant="text" width={220} height={12} className="mb-3" />
      <Skeleton variant="text" width="55%" height={32} />
      <Skeleton variant="text" width="40%" height={32} className="mt-3" />
      <Skeleton variant="text" width="55%" height={16} className="mt-3" />
    </div>
  </div>
);

/**
 * Skeleton for MainTreeDetail page (hero + tech/app tabs + sub-category cards).
 */
Skeleton.MainTreeDetail = () => (
  <div className="bg-white" aria-busy="true">
    {/* Hero */}
    <section className="border-b border-gray-100 bg-gradient-to-br from-primary-50/60 via-white to-white">
      <div className="container-page py-6 md:py-8">
        <Skeleton variant="text" width={260} height={11} className="mb-4" />
        <div className="flex items-start gap-5">
          <div className="hidden md:block flex-shrink-0">
            <Skeleton variant="rect" width={64} height={64} className="rounded-2xl" />
          </div>
          <div className="flex-1 space-y-3">
            <Skeleton variant="text" width="45%" height={30} />
            <Skeleton variant="text" width="70%" height={14} />
          </div>
        </div>
      </div>
    </section>

    <div className="container-page">
      {/* Tech/App section skeleton */}
      <section className="py-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton variant="text" width={180} height={16} />
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1 mb-5 p-0.5 bg-gray-50 rounded-xl w-fit">
          <Skeleton variant="rect" width={120} height={34} className="rounded-lg" />
          <Skeleton variant="rect" width={120} height={34} className="rounded-lg" />
        </div>

        {/* Cards grid — 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="h-0.5 bg-gray-100" />
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton variant="rect" width={36} height={36} className="rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="80%" height={11} />
                    <Skeleton variant="text" width="60%" height={13} />
                  </div>
                </div>
                <Skeleton variant="text" width="100%" height={10} />
                <Skeleton variant="text" width="85%" height={10} />
                <Skeleton variant="text" width="60%" height={10} />
                <div className="pt-2 border-t border-gray-50 flex justify-between">
                  <Skeleton variant="text" width={60} height={10} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sub-categories skeleton */}
      <section className="py-8 border-t border-gray-100">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div>
            <Skeleton variant="text" width={140} height={16} />
            <Skeleton variant="text" width={80} height={11} className="mt-1" />
          </div>
        </div>

        {/* Search + Sort bar */}
        <div className="flex items-center gap-3 mb-5">
          <Skeleton variant="rect" width={240} height={38} className="rounded-lg" />
          <Skeleton variant="rect" width={140} height={38} className="rounded-lg" />
        </div>

        {/* Cards grid — 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <Skeleton variant="rect" width="100%" height={140} className="rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton variant="text" width="70%" height={15} />
                <Skeleton variant="text" width="100%" height={10} />
                <Skeleton variant="text" width="85%" height={10} />
                <Skeleton variant="text" width="55%" height={10} />
                <Skeleton variant="text" width={90} height={11} className="mt-1" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>

    <div className="container-page pb-8">
      <Skeleton variant="text" width={120} height={11} />
    </div>
  </div>
);

/**
 * Skeleton for CategoryDetail page (hero + banner + description + SKU table).
 */
Skeleton.CategoryDetail = () => (
  <div className="bg-white" aria-busy="true">
    {/* Hero */}
    <Skeleton.PageHero />

    {/* Banner */}
    <div className="container-page -mt-4 mb-8">
      <div className="max-w-3xl mx-auto">
        <Skeleton variant="rect" width="100%" height={220} className="rounded-xl" />
      </div>
    </div>

    {/* Description */}
    <div className="container-page mb-8 space-y-2.5">
      <Skeleton variant="text" width="100%" height={13} />
      <Skeleton variant="text" width="96%" height={13} />
      <Skeleton variant="text" width="88%" height={13} />
    </div>

    {/* Back link */}
    <div className="container-page mb-6">
      <Skeleton variant="text" width={180} height={12} />
    </div>

    {/* Section header */}
    <div className="container-page py-8 md:py-10">
      <div className="flex items-end justify-between mb-6 md:mb-8 gap-3 flex-wrap">
        <div className="space-y-2">
          <Skeleton variant="text" width={100} height={11} />
          <Skeleton variant="text" width={180} height={18} />
        </div>
        <Skeleton variant="text" width={120} height={13} />
      </div>

      {/* SKU table — desktop */}
      <div className="hidden md:block">
        <div className="w-full">
          <div className="border-b border-gray-200 grid grid-cols-12 gap-3 pb-3">
            <Skeleton variant="text" width={70} height={10} className="col-span-2" />
            <Skeleton variant="text" width={60} height={10} className="col-span-3" />
            <Skeleton variant="text" width={80} height={10} className="col-span-2" />
            <Skeleton variant="text" width={60} height={10} className="col-span-2" />
            <Skeleton variant="text" width={40} height={10} className="col-span-1" />
            <Skeleton variant="text" width={50} height={10} className="col-span-1" />
            <Skeleton variant="text" width={50} height={10} className="col-span-1" />
          </div>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="border-b border-gray-100 py-3 grid grid-cols-12 gap-3 items-center">
              <div className="col-span-2 flex items-center gap-2.5">
                <Skeleton variant="rect" width={40} height={40} className="rounded-lg" />
                <Skeleton variant="text" width={48} height={11} />
              </div>
              <div className="col-span-3">
                <Skeleton variant="text" width="90%" height={12} />
              </div>
              <div className="col-span-2">
                <Skeleton variant="text" width={60} height={11} />
              </div>
              <div className="col-span-2">
                <Skeleton variant="text" width={50} height={11} />
              </div>
              <div className="col-span-1">
                <Skeleton variant="text" width={40} height={11} />
              </div>
              <div className="col-span-1">
                <Skeleton variant="text" width={55} height={11} />
              </div>
              <div className="col-span-1 flex justify-end">
                <Skeleton variant="rect" width={72} height={26} className="rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SKU cards — mobile */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="border border-gray-100 rounded-xl p-3.5 bg-white">
            <div className="flex items-start gap-3">
              <Skeleton variant="rect" width={56} height={56} className="rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width={70} height={12} />
                <Skeleton variant="text" width="85%" height={12} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
              <Skeleton variant="text" width={80} height={11} />
              <Skeleton variant="rect" width={90} height={26} className="rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Skeleton list rows (e.g. for a sidebar / table inside the page).
 */
Skeleton.List = ({ rows = 4, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="flex items-center gap-3">
        <Skeleton variant="circle" width={36} height={36} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width={`${50 + (idx % 3) * 10}%`} />
          <Skeleton variant="text" width={`${30 + (idx % 4) * 8}%`} height={10} />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
