import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPhone,
  FiMessageCircle,
  FiMail,
  FiGlobe,
  FiMapPin,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiTwitter,
  FiLinkedin,
  FiMessageSquare,
  FiSend,
  FiHeadphones,
  FiHelpCircle,
} from 'react-icons/fi';
import {
  FaWhatsapp,
  FaTelegram,
  FaLine,
  FaViber,
  FaTiktok,
  FaWeixin,
} from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';

const ICON_DISPLAY = {
  FiPhone: { icon: FiPhone, color: 'text-green-500', label: 'Điện thoại' },
  FiMessageCircle: { icon: FiMessageCircle, color: 'text-blue-500', label: 'Messenger' },
  FiMail: { icon: FiMail, color: 'text-red-500', label: 'Email' },
  FiGlobe: { icon: FiGlobe, color: 'text-purple-500', label: 'Website' },
  FiMapPin: { icon: FiMapPin, color: 'text-red-500', label: 'Địa chỉ' },
  FiClock: { icon: FiClock, color: 'text-orange-500', label: 'Giờ mở cửa' },
  FiFacebook: { icon: FiFacebook, color: 'text-blue-600', label: 'Facebook' },
  FiInstagram: { icon: FiInstagram, color: 'text-pink-500', label: 'Instagram' },
  FiYoutube: { icon: FiYoutube, color: 'text-red-600', label: 'YouTube' },
  FiTwitter: { icon: FiTwitter, color: 'text-sky-500', label: 'X (Twitter)' },
  FiLinkedin: { icon: FiLinkedin, color: 'text-blue-700', label: 'LinkedIn' },
  FiMessageSquare: { icon: FiMessageSquare, color: 'text-indigo-500', label: 'Tin nhắn' },
  FiSend: { icon: FiSend, color: 'text-cyan-500', label: 'Gửi' },
  FiHeadphones: { icon: FiHeadphones, color: 'text-emerald-500', label: 'Hỗ trợ' },
  FiHelpCircle: { icon: FiHelpCircle, color: 'text-amber-500', label: 'Hỏi đáp' },
  FaWhatsapp: { icon: FaWhatsapp, color: 'text-green-500', label: 'WhatsApp' },
  FaTelegram: { icon: FaTelegram, color: 'text-sky-500', label: 'Telegram' },
  FaLine: { icon: FaLine, color: 'text-green-600', label: 'LINE' },
  FaViber: { icon: FaViber, color: 'text-purple-600', label: 'Viber' },
  FaTiktok: { icon: FaTiktok, color: 'text-gray-900', label: 'TikTok' },
  FaWeixin: { icon: FaWeixin, color: 'text-green-600', label: 'WeChat' },
  SiZalo: { icon: SiZalo, color: 'text-blue-500', label: 'Zalo' },
  // Legacy key: dữ liệu cũ lưu "Zalo" thay vì "SiZalo".
  Zalo: { icon: SiZalo, color: 'text-blue-500', label: 'Zalo' },
};

const FloatingContactBar = ({ contacts = [] }) => {
  const [hoveredId, setHoveredId] = useState(null);

  if (!contacts || contacts.length === 0) return null;

  const getKey = (contact, index) => {
    if (contact?._id != null) {
      if (typeof contact._id === 'string') return contact._id;
      if (typeof contact._id === 'object' && typeof contact._id.toHexString === 'function') {
        return contact._id.toHexString();
      }
      if (typeof contact._id === 'object' && contact._id._id) {
        return String(contact._id._id);
      }
      return String(contact._id);
    }
    return `floating-contact-${index}`;
  };

  return (
    <div className="fixed right-4 bottom-20 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {contacts.map((contact, index) => {
          const config = ICON_DISPLAY[contact.icon] || ICON_DISPLAY.FiPhone;
          const IconComponent = config.icon;
          const isImageIcon =
            typeof contact.icon === 'string' &&
            (contact.icon.startsWith('http') || contact.icon.startsWith('/'));
          const key = getKey(contact, index);
          const isHovered = hoveredId === key;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: 20 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className="relative"
              onMouseEnter={() => setHoveredId(key)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <a
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 ${isImageIcon ? '' : config.color} hover:scale-110`}
                title={contact.label || config.label}
              >
                {isImageIcon ? (
                  <img src={contact.icon} alt="" className="w-6 h-6 object-contain" />
                ) : (
                  <IconComponent size={24} />
                )}
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
