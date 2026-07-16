import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPhone,
  FiMessageCircle,
  FiMail,
  FiGlobe,
  FiMapPin,
  FiClock,
} from 'react-icons/fi';

const ICON_MAP = {
  FiPhone,
  FiMessageCircle,
  FiMail,
  FiGlobe,
  FiMapPin,
  FiClock,
};

const ZaloIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm2.5-6.5c0 .83-.67 1.5-1.5 1.5H10V17h-2v-5h2v-1.5c0-2 2-2.5 3-2.5 1 0 2 .5 2 2v1h-1.5c-.28 0-.5.22-.5.5z"/>
  </svg>
);

const MessengerIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.25 2.67 7.9 6.44 9.34-.09-.79-.15-1.89-.03-2.65.03-.17.1-.29.23-.38.13-.09.26-.04.38.04l1.58.94c.09.05.18.08.26.08.12 0 .23-.05.32-.15l1.9-3.12c.2.05.41.08.62.08.5 0 .99-.09 1.45-.25l.52 1.89c.04.13.13.24.25.31.12.07.26.08.39.04l1.94-.97c.14-.07.22-.22.22-.38-.01-1.83-.56-3.53-1.5-4.93.18-.21.35-.44.5-.68.06-.1.09-.2.09-.32 0-.12-.04-.23-.1-.33l-.5-.86c-.05-.09-.08-.19-.08-.3 0-.11.03-.22.08-.32l.36-.62c.04-.07.06-.15.06-.24 0-.09-.02-.18-.06-.25l-.38-.66c-.05-.08-.07-.17-.07-.27 0-.1.02-.19.07-.27l.36-.62c.04-.07.06-.15.06-.24 0-.09-.02-.18-.06-.25l-.25-.43c-.04-.07-.06-.15-.06-.24 0-.09.02-.18.06-.25l-.09-.16c-.04-.07-.06-.15-.06-.24 0-.09.02-.18.06-.25l-.07-.12c-.04-.07-.06-.15-.06-.24 0-.09.02-.18.06-.25l-.04-.07c-.04-.07-.06-.15-.06-.24 0-.09.02-.18.06-.25l-.02-.04C15.5 5.5 16 5 16 4.5c0-.28-.22-.5-.5-.5H12c-.28 0-.5.22-.5.5 0 .28.22.5.5.5h2.5v.5H12c-.28 0-.5.22-.5.5 0 .28.22.5.5.5h2.5v.5H12c-.28 0-.5.22-.5.5 0 .28.22.5.5.5h2.5v.5H12c-.28 0-.5.22-.5.5 0 .28.22.5.5.5h.04l-.01.02z"/>
  </svg>
);

const ICON_DISPLAY = {
  FiPhone: { icon: FiPhone, color: 'text-green-500', label: 'Phone' },
  FiMessageCircle: { icon: MessengerIcon, color: 'text-blue-500', label: 'Messenger' },
  FiMail: { icon: FiMail, color: 'text-red-500', label: 'Email' },
  FiGlobe: { icon: FiGlobe, color: 'text-blue-500', label: 'Website' },
  FiMapPin: { icon: FiMapPin, color: 'text-red-500', label: 'Location' },
  FiClock: { icon: FiClock, color: 'text-purple-500', label: 'Hours' },
  Zalo: { icon: ZaloIcon, color: 'text-blue-500', label: 'Zalo' },
};

const FloatingContactBar = ({ contacts = [] }) => {
  const [hoveredId, setHoveredId] = useState(null);

  if (!contacts || contacts.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-20 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {contacts.map((contact, index) => {
          const config = ICON_DISPLAY[contact.icon] || ICON_DISPLAY.FiPhone;
          const IconComponent = config.icon;
          const isHovered = hoveredId === contact._id;

          return (
            <motion.div
              key={contact._id || index}
              initial={{ opacity: 0, scale: 0, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: 20 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className="relative"
              onMouseEnter={() => setHoveredId(contact._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <a
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 ${config.color} hover:scale-110`}
                title={contact.label || config.label}
              >
                <IconComponent />
              </a>

              <AnimatePresence>
                {isHovered && contact.label && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md shadow-lg"
                  >
                    {contact.label}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FloatingContactBar;
