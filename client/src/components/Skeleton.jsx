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
Skeleton.CardGrid = ({ rows = 2, cols = 4, gap = 'gap-5 md:gap-6', className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gap} ${className}`}>
    {Array.from({ length: rows * cols }).map((_, idx) => (
      <div key={idx} className="space-y-3">
        <Skeleton variant="rect" height={180} width="100%" className="rounded-xl" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" />
      </div>
    ))}
  </div>
);

/**
 * Skeleton for MarketDetail page (hero + tabs + content).
 */
Skeleton.MarketDetail = () => (
  <div className="pb-24 md:pb-28" aria-busy="true">
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50/50" />
      <div className="relative container-page py-12 md:py-16 lg:py-20">
        <Skeleton variant="text" width={220} height={12} className="mb-5" />
        <Skeleton variant="text" width="60%" height={36} />
        <Skeleton variant="text" width="80%" height={36} className="mt-3" />
        <Skeleton variant="text" width="50%" height={16} className="mt-4" />
      </div>
    </div>
    <div className="container-page -mt-6 mb-8">
      <Skeleton variant="rect" width="100%" height={360} className="rounded-2xl" />
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
    <div className="relative container-page py-12 md:py-16 lg:py-20">
      <Skeleton variant="text" width={220} height={12} className="mb-5" />
      <Skeleton variant="text" width="55%" height={36} />
      <Skeleton variant="text" width="40%" height={36} className="mt-3" />
      <Skeleton variant="text" width="55%" height={16} className="mt-4" />
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
