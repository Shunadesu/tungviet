import { useEffect, useRef, useState } from 'react';
import { FiBookOpen, FiCpu, FiPackage, FiShoppingBag } from 'react-icons/fi';

const ICONS = {
  overview: FiBookOpen,
  technologies: FiCpu,
  applications: FiPackage,
  products: FiShoppingBag,
};

const MarketDetailTabs = ({
  tabs,
  activeId,
  onChange,
  counts = {},
  labelClassName = '',
}) => {
  const containerRef = useRef(null);
  const buttonRefs = useRef({});
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = buttonRefs.current[activeId];
    const container = containerRef.current;
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setUnderline({
      left: elRect.left - containerRect.left,
      width: elRect.width,
    });
  }, [activeId, tabs]);

  useEffect(() => {
    const handleResize = () => {
      const el = buttonRefs.current[activeId];
      const container = containerRef.current;
      if (!el || !container) return;
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setUnderline({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeId]);

  const handleKeyDown = (e, id, index) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const direction = e.key === 'ArrowRight' ? 1 : -1;
    const next = (index + direction + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    buttonRefs.current[tabs[next].id]?.focus();
  };

  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Market detail sections"
        className="container-page relative flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-thin"
      >
        {tabs.map((tab, index) => {
          const Icon = ICONS[tab.id] || FiBookOpen;
          const count = counts[tab.id];
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                if (node) buttonRefs.current[tab.id] = node;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
              className={`relative inline-flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-t-md ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon size={15} className="opacity-80" />
              <span className={labelClassName}>{tab.label}</span>
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <span
          aria-hidden="true"
          className="absolute bottom-0 h-[2px] bg-primary rounded-full transition-all duration-200 ease-out"
          style={{
            left: `${underline.left}px`,
            width: `${underline.width}px`,
          }}
        />
      </div>
    </div>
  );
};

export default MarketDetailTabs;