import { motion } from 'framer-motion';
import { FiAlertTriangle, FiInbox, FiWifiOff, FiSearch } from 'react-icons/fi';

/**
 * Reusable error / empty / not-found state.
 *
 * variant:
 *   - 'notFound' (default): 404 / missing entity — uses FiInbox icon
 *   - 'error':               network/server failure — uses FiWifiOff icon
 *   - 'noResults':           search yielded nothing — uses FiSearch icon
 *   - 'warning':             generic soft warning — uses FiAlertTriangle icon
 *
 * Pass `action` (a node) for a CTA button row. Pass `onRetry` for a default
 * "Try again" button when an error variant is used.
 */
const ErrorState = ({
  variant = 'notFound',
  title,
  description,
  icon,
  action,
  onRetry,
  className = '',
}) => {
  const Icon = icon || (
    variant === 'error' ? FiWifiOff
      : variant === 'noResults' ? FiSearch
      : variant === 'warning' ? FiAlertTriangle
      : FiInbox
  );

  const accent =
    variant === 'error'
      ? 'bg-red-50 text-red-600'
      : variant === 'warning'
        ? 'bg-amber-50 text-amber-600'
        : 'bg-primary-50 text-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}
    >
      <div className={`w-16 h-16 rounded-2xl ${accent} flex items-center justify-center mb-4`}>
        <Icon size={28} aria-hidden="true" />
      </div>
      {title && (
        <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-slate-500 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {(action || onRetry) && (
        <div className="mt-6 flex items-center gap-3 flex-wrap justify-center">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {variant === 'error' ? 'Try again' : 'Reload'}
            </button>
          )}
          {action}
        </div>
      )}
    </motion.div>
  );
};

export default ErrorState;
