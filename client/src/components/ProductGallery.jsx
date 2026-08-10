import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZoomIn } from 'react-icons/fi';
import placeholderProduct from '../assets/placeholder-product.svg';

/**
 * Gallery sản phẩm: ảnh chính lớn + thumbnails bên dưới.
 * Click thumbnail đổi ảnh chính. Hover zoom nhẹ.
 * Nếu chỉ có 1 ảnh thì ẩn thumbnails.
 */
const ProductGallery = ({ images = [], name = '', tdsUrl }) => {
  const safeImages = Array.isArray(images) && images.length > 0 ? images : [null];
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  // Reset active idx when image list changes (e.g. navigating to a different product)
  useEffect(() => {
    setActiveIdx(0);
  }, [images.length, images[0]]);

  const current = safeImages[activeIdx] || null;
  const hasMultiple = safeImages.length > 1;

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 cursor-zoom-in group"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMove}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIdx}
            src={current || placeholderProduct}
            alt={name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-cover"
            style={{
              transform: zoom ? 'scale(1.15)' : 'scale(1)',
              transformOrigin: origin,
              transition: 'transform 0.4s ease-out',
            }}
            onError={(e) => {
              e.currentTarget.src = placeholderProduct;
            }}
          />
        </AnimatePresence>

        {/* Zoom hint */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg p-2 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <FiZoomIn size={14} />
        </div>

        {/* TDS badge */}
        {tdsUrl && (
          <a
            href={tdsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm hover:bg-accent hover:text-white text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-soft transition-colors"
          >
            PDF TDS
          </a>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="grid grid-cols-4 gap-2">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                idx === activeIdx
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <img
                src={img || placeholderProduct}
                alt={`${name}-${idx}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = placeholderProduct;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;