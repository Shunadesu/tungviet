import { motion } from 'framer-motion';

const SectionHeader = ({ title, subtitle, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <h2 className="text-base font-semibold text-primary">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1 ml-6">{subtitle}</p>
      )}
      <div className="w-16 h-0.5 bg-primary mt-2"></div>
    </motion.div>
  );
};

export default SectionHeader;
