import { motion } from 'framer-motion';
import { FiInbox } from 'react-icons/fi';

/**
 * Empty state với icon, title, subtitle và optional CTA.
 */
const EmptyState = ({
  icon: Icon = FiInbox,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mb-4">
        <Icon size={28} />
      </div>
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-slate-500 max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
};

export default EmptyState;