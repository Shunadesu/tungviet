import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const variants = {
  left: 'text-left items-start',
  center: 'text-center items-center',
};

const SectionHeader = ({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  align = 'left',
  className = '',
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={cn('flex flex-col gap-2', variants[align], className)}
    >
      {eyebrow && (
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="text-primary">
              <Icon size={14} />
            </span>
          )}
          <span className="heading-eyebrow">{eyebrow}</span>
        </div>
      )}
      <h2 className="heading-section md:heading-display">{title}</h2>
      {subtitle && (
        <p
          className={cn(
            'text-sm md:text-base text-slate-600 leading-relaxed',
            align === 'center' ? 'max-w-2xl' : 'max-w-2xl'
          )}
        >
          {subtitle}
        </p>
      )}
      {children}
    </motion.div>
  );
};

export default SectionHeader;