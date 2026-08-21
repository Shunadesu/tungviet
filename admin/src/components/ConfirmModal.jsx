import Modal from './Modal';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmStyle = 'danger',
  loading = false,
}) => {
  const buttonClass =
    confirmStyle === 'primary'
      ? 'bg-primary text-white hover:bg-primary/90'
      : 'bg-red-600 text-white hover:bg-red-700';

  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} title={title} size="sm">
      <div className="space-y-4">
        {typeof message === 'string' ? (
          <p className="text-sm text-gray-700 whitespace-pre-line">{message}</p>
        ) : (
          message
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary text-xs disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`text-xs px-3 py-1.5 rounded font-medium transition-colors disabled:opacity-50 ${buttonClass}`}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
