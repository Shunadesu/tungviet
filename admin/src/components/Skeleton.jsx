const baseShimmer =
  'relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]';

const Skeleton = ({ variant = 'text', width, height, className = '', style = {}, rounded = false }) => {
  const sizeStyle = {
    width: width || undefined,
    height: height || undefined,
    ...style,
  };

  let cls = `${baseShimmer} ${className}`;
  if (rounded) cls += ' rounded-full';

  if (variant === 'circle') {
    return (
      <span
        className={`${cls} inline-block rounded-full`}
        style={{ ...sizeStyle, width: width || height || 40, height: height || width || 40 }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'rect') {
    return <span className={`${cls} inline-block rounded`} style={sizeStyle} aria-hidden="true" />;
  }

  if (variant === 'card') {
    return (
      <span
        className={`${cls} inline-block rounded-lg border border-gray-200`}
        style={sizeStyle}
        aria-hidden="true"
      />
    );
  }

  // text variant default
  return (
    <span
      className={`${cls} inline-block rounded ${variant === 'text' ? 'h-3' : ''}`}
      style={sizeStyle}
      aria-hidden="true"
    />
  );
};

Skeleton.Group = ({ children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>{children}</div>
);

Skeleton.Row = ({ columns = 5, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    {Array.from({ length: columns }).map((_, idx) => (
      <Skeleton
        key={idx}
        variant="rect"
        height={14}
        width={idx === 0 ? 24 : `${Math.max(8, 60 - idx * 6)}%`}
        className="flex-shrink-0"
      />
    ))}
  </div>
);

Skeleton.Table = ({ rows = 5, columns = 5, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          {Array.from({ length: columns }).map((_, idx) => (
            <th key={idx} className="px-2 py-2">
              <Skeleton variant="rect" height={10} width="60%" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx} className="border-b border-gray-100">
            {Array.from({ length: columns }).map((__, colIdx) => (
              <td key={colIdx} className="px-2 py-3">
                {colIdx === 1 ? (
                  <Skeleton variant="circle" width={28} height={28} />
                ) : (
                  <Skeleton variant="rect" height={10} width={`${60 + ((rowIdx + colIdx) % 4) * 8}%`} />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

Skeleton.Editor = ({ rows = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    <div className="flex items-center justify-between border-b pb-3">
      <Skeleton variant="rect" height={16} width={220} />
      <Skeleton variant="rect" height={28} width={120} rounded />
    </div>
    {Array.from({ length: rows }).map((_, idx) => (
      <div
        key={idx}
        className="border border-gray-200 rounded-lg p-3 bg-gray-50/40 space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="circle" width={28} height={28} />
            <Skeleton variant="rect" height={12} width={140} />
          </div>
          <Skeleton variant="rect" height={20} width={40} rounded />
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          <Skeleton variant="rect" height={32} width="100%" />
          <Skeleton variant="rect" height={32} width="100%" />
        </div>
        <Skeleton variant="rect" height={48} width="100%" />
      </div>
    ))}
  </div>
);

Skeleton.Form = ({ className = '' }) => (
  <div className={`card mx-auto space-y-3 p-4 ${className}`}>
    <div className="grid md:grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Skeleton variant="rect" height={12} width="30%" />
        <Skeleton variant="rect" height={36} width="100%" />
      </div>
      <div className="space-y-1.5">
        <Skeleton variant="rect" height={12} width="40%" />
        <Skeleton variant="rect" height={36} width="100%" />
      </div>
    </div>
    <div className="space-y-1.5">
      <Skeleton variant="rect" height={12} width="20%" />
      <Skeleton variant="rect" height={36} width="100%" />
    </div>
    <div className="space-y-1.5">
      <Skeleton variant="rect" height={12} width="15%" />
      <Skeleton variant="rect" height={100} width="100%" />
    </div>
    <div className="space-y-1.5">
      <Skeleton variant="rect" height={12} width="30%" />
      <Skeleton variant="rect" height={100} width="100%" />
    </div>
    <div className="grid md:grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Skeleton variant="rect" height={12} width="25%" />
        <Skeleton variant="rect" height={60} width="100%" />
      </div>
      <div className="space-y-1.5">
        <Skeleton variant="rect" height={12} width="15%" />
        <Skeleton variant="rect" height={60} width="100%" />
      </div>
    </div>
    <div className="flex gap-3 pt-2">
      <Skeleton variant="rect" height={12} width="15%" />
      <Skeleton variant="rect" height={12} width="15%" />
    </div>
    <div className="border-t pt-3 flex gap-2">
      <Skeleton variant="rect" height={36} width={80} rounded />
      <Skeleton variant="rect" height={36} width={100} rounded />
    </div>
  </div>
);

Skeleton.List = ({ rows = 5, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          {['10%', '10%', '20%', '10%', '10%', '25%', '8%'].map((w, idx) => (
            <th key={idx} className="px-2 py-2">
              <Skeleton variant="rect" height={10} width={w} />
            </th>
          ))}
          <th className="px-2 py-2"><Skeleton variant="rect" height={10} width="7%" /></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx} className="border-b border-gray-100">
            <td className="px-2 py-3"><Skeleton variant="rect" height={10} width="50%" /></td>
            <td className="px-2 py-3"><Skeleton variant="circle" width={28} height={28} /></td>
            <td className="px-2 py-3"><Skeleton variant="rect" height={12} width="70%" /></td>
            <td className="px-2 py-3"><Skeleton variant="rect" height={10} width="60%" /></td>
            <td className="px-2 py-3"><Skeleton variant="rect" height={20} width={28} rounded /></td>
            <td className="px-2 py-3"><Skeleton variant="rect" height={10} width="80%" /></td>
            <td className="px-2 py-3"><Skeleton variant="rect" height={10} width="40%" /></td>
            <td className="px-2 py-3"><div className="flex gap-1"><Skeleton variant="rect" height={20} width={20} rounded /><Skeleton variant="rect" height={20} width={20} rounded /><Skeleton variant="rect" height={20} width={20} rounded /></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Skeleton;
