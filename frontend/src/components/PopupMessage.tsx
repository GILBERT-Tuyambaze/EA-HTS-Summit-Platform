import { X } from 'lucide-react';

type PopupMessageProps = {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
};

export default function PopupMessage({ title, message, type = 'info', onClose }: PopupMessageProps) {
  return (
    <div className="popup-message-overlay" role="status" aria-live="assertive">
      <div className={`popup-message-card popup-${type}`}>
        <div className="popup-message-header">
          <div>
            <p className="popup-message-title">{title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice')}</p>
          </div>
          <button type="button" className="popup-close-button" onClick={onClose} aria-label="Close notification">
            <X />
          </button>
        </div>
        <p className="popup-message-body">{message}</p>
      </div>
    </div>
  );
}
