import type { ReactNode } from 'react';
type ConfirmModalProps = { open: boolean; title: string; description: string; confirmLabel?: string; destructive?: boolean; className?: string; topBar?: ReactNode; onConfirm: () => void; onCancel: () => void; children?: ReactNode };
export default function ConfirmModal({ open, title, description, confirmLabel = 'Confirm', destructive, className, topBar, onConfirm, onCancel, children }: ConfirmModalProps) {
  if (!open) return null;
  return <div className={`confirm-overlay ${className ?? ''}`.trim()} role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div className={`confirm-card ${className ?? ''}`.trim()}>{topBar}{title ? <h2 id="confirm-title">{title}</h2> : null}{description ? <p>{description}</p> : null}{children}<div><button className="btn btn-outline" onClick={onCancel}>Cancel</button><button className={`btn ${destructive ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button></div></div></div>;
}
