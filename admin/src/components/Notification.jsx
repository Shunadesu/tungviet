import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { useNotification } from '../context/NotificationContext';

const Notification = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((noti) => (
          <motion.div
            key={noti.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm ${
              noti.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {noti.type === 'success' ? <FiCheck size={16} /> : <FiAlertCircle size={16} />}
            <span>{noti.message}</span>
            <button onClick={() => removeNotification(noti.id)} className="ml-2 hover:opacity-70">
              <FiX size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
