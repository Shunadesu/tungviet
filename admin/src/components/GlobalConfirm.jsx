/**
 * GlobalConfirm — reads confirm state from the store and renders
 * ConfirmModal as a singleton at the app root.
 *
 * Add once to App.jsx inside <BrowserRouter>.
 */
import { useCallback } from 'react';
import { useAdminStore } from '../store/adminStore';
import ConfirmModal from './ConfirmModal';

const GlobalConfirm = () => {
  const confirm = useAdminStore((s) => s.ui.confirm);
  const closeConfirm = useAdminStore((s) => s.ui.closeConfirm);

  const handleConfirm = useCallback(() => {
    if (confirm?.onConfirm) {
      confirm.onConfirm();
    }
    closeConfirm();
  }, [confirm, closeConfirm]);

  return (
    <ConfirmModal
      isOpen={Boolean(confirm)}
      onClose={closeConfirm}
      onConfirm={handleConfirm}
      title={confirm?.title}
      message={confirm?.message}
      confirmText={confirm?.confirmText}
      cancelText={confirm?.cancelText}
      confirmStyle={confirm?.confirmStyle}
      loading={false}
    />
  );
};

export default GlobalConfirm;
