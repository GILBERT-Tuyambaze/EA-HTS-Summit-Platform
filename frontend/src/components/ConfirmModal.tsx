import type { ReactNode } from 'react';
type ConfirmModalProps = { open: boolean; title: string; description: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void; onCancel: () => void; children?: ReactNode };
export default function ConfirmModal({ open, title, description, confirmLabel = 'Confirm', destructive, onConfirm, onCancel, children }: ConfirmModalProps) {
  if (!open) return null;
  return <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div className="confirm-card"><h2 id="confirm-title">{title}</h2><p>{description}</p>{children}<div><button className="btn btn-outline" onClick={onCancel}>Cancel</button><button className={`btn ${destructive ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button></div></div></div>;
}
