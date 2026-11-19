import { useCallback, useState } from 'react';
import clientApi from '../api/clientApi';import { useAuth } from '../context/AuthContext';
import { useAuthDrawer } from '../context/AuthDrawerContext';

// Mở file TDS: chưa đăng nhập thì mở drawer đăng nhập; đã đăng nhập thì ghi nhận lượt tải rồi mở file.
export const useTdsDownload = () => {
  const { user } = useAuth();
  const { openAuthDrawer } = useAuthDrawer();
  const [pending, setPending] = useState(false);

  const download = useCallback(
    async (e, { productId, tdsUrl }) => {
      e?.preventDefault?.();
      if (!user) {
        openAuthDrawer('login');
        return;
      }
      if (!productId || !tdsUrl || pending) return;
      setPending(true);
      try {
        const res = await clientApi.recordTdsDownload(productId);
        const url = res.data?.data?.tdsUrl || tdsUrl;
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (err) {
        if (err.response?.status === 401) {
          openAuthDrawer('login');
        } else {
          window.alert(err.response?.data?.message || 'Không thể tải TDS, vui lòng thử lại.');
        }
      } finally {
        setPending(false);
      }
    },
    [user, openAuthDrawer, pending]
  );

  return { download, pending };
};

export default useTdsDownload;
