import { useMemo } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

/**
 * useHomeSection - đọc cấu hình 1 section trong trang chủ từ API
 * (/public/site-config → homeSections).
 *
 * Trả về:
 *  - enabled: section có được bật hay không (mặc định true nếu chưa cấu hình)
 *  - title / subtitle: tiêu đề + mô tả do Admin khai báo (có thể rỗng)
 *  - limit: giới hạn số lượng item (0 = không giới hạn)
 *
 * Nhờ đây, trang chủ không còn hiển thị tiêu đề/nội dung hardcoded.
 */
const useHomeSection = (key) => {
  const { homeSections = [] } = useSiteConfig();

  return useMemo(() => {
    const found = (homeSections || []).find((s) => s && s.key === key);
    if (!found) {
      return { enabled: true, title: '', subtitle: '', limit: 0, found: false };
    }
    return {
      enabled: found.enabled !== false,
      title: found.title || '',
      subtitle: found.subtitle || '',
      limit: typeof found.limit === 'number' ? found.limit : 0,
      found: true,
    };
  }, [homeSections, key]);
};

export default useHomeSection;
