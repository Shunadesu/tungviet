import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-white rounded-lg w-full ${sizes[size]} max-h-[90vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FiX size={18} />
          </button>
        </div>
        <div className="p-3 overflow-y-auto max-h-[calc(90vh-60px)]">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Modal;
