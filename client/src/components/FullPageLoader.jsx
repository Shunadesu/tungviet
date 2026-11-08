import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * FullPageLoader — overlay phủ toàn bộ viewport trong lúc dữ liệu trang
 * (logo, banner/slide, cấu hình site) đang được tải.
 *
 * Mục đích: thay thế hoàn toàn các fallback "giả" (logo mặc định, banner
 * gradient cứng, chứng nhận hardcoded) bằng một trạng thái loading thống
 * nhất cho toàn bộ layout.
 *
 * Gồm 2 phần:
 *  - Vòng tròn gradient quay (conic-gradient + spin) ở giữa.
 *  - Thanh tiến trình chạy ngang không xác định (indeterminate) ở mép trên.
 */
const FullPageLoader = ({ label, className = '' }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`fixed inset-0 z-[95] flex items-center justify-center bg-white/90 backdrop-blur-[2px] ${className}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Thanh loading quay ngang ở mép trên */}
      <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden bg-primary-50">
        <motion.div
          className="h-full w-1/3 rounded-full bg-primary"
          animate={{ x: ['-120%', '320%'] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="flex flex-col items-center">
        {/* Vòng quay */}
        <div className="relative h-14 w-14">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, rgba(21,128,61,0) 0deg, #15803d 120deg, #22c55e 220deg, rgba(21,128,61,0) 360deg)',
              animation: 'fullPageLoaderSpin 0.9s linear infinite',
            }}
          />
          <div className="absolute inset-[3px] rounded-full bg-white" />
          <div className="absolute inset-[3px] rounded-full border-2 border-primary/15" />
        </div>

        <p className="mt-4 text-xs font-medium text-slate-500">
          {label || t('common.loading')}
        </p>
      </div>

      <style>{`
        @keyframes fullPageLoaderSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FullPageLoader;
