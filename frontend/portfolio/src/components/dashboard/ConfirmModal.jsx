import { AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete Record',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? undefined : onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            size="sm"
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5 py-1">
        <div className="p-2.5 rounded-lg bg-danger/10 text-danger shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <p className="font-mono text-xs font-semibold text-text">{title}</p>
          <p className="font-mono text-xs text-text-muted leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
