import React, { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';
import { useProgress } from '../contexts/ProgressContext';
import { verifyPayment } from '../services/registrationService';

export default function VerifyPaymentModal({
  registrationId,
  fullName,
  onClose,
  onSaved,
}: {
  registrationId: string;
  fullName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Rejected'>('Paid');
  const [paymentMethod, setPaymentMethod] = useState<'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_TRANSFER'>('MTN_MOMO');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { showPopup } = usePopup();
  const { openProgress, updateProgress, closeProgress } = useProgress();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    openProgress({
      title: 'Verifying payment',
      description: 'Updating payment status and notifying the participant.',
      steps: [
        { label: 'Validating input', status: 'active' },
        { label: 'Updating payment record', status: 'pending' },
        { label: 'Sending notification', status: 'pending' },
      ],
    });

    if (paymentStatus === 'Paid' && !paymentReference) {
      updateProgress({
        steps: [
          { label: 'Validating input', status: 'error' },
          { label: 'Updating payment record', status: 'pending' },
          { label: 'Sending notification', status: 'pending' },
        ],
      });
      showPopup({ type: 'error', message: 'Payment reference is required when marking as Paid.' });
      closeProgress();
      setSaving(false);
      return;
    }

    try {
      updateProgress({
        steps: [
          { label: 'Validating input', status: 'complete' },
          { label: 'Updating payment record', status: 'active' },
          { label: 'Sending notification', status: 'pending' },
        ],
      });

      await verifyPayment(registrationId, {
        paymentStatus,
        paymentMethod,
        paymentReference,
        verificationNotes: notes,
      });

      updateProgress({
        steps: [
          { label: 'Validating input', status: 'complete' },
          { label: 'Updating payment record', status: 'complete' },
          { label: 'Sending notification', status: 'complete' },
        ],
      });
      showPopup({ type: 'success', message: 'Payment verified successfully. Confirmation email sent.' });
      onSaved();
      setTimeout(() => {
        closeProgress();
        onClose();
      }, 900);
    } catch (error: any) {
      updateProgress({
        steps: [
          { label: 'Validating input', status: 'complete' },
          { label: 'Updating payment record', status: 'error' },
          { label: 'Sending notification', status: 'pending' },
        ],
      });
      const msg = error?.message ?? (error?.toString?.() ?? 'Unable to verify payment.');
      showPopup({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h3>Verify payment</h3>
            <small>Mark payment as confirmed for {fullName}</small>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field">
            <span>Payment status</span>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Rejected')}>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>

          <label className="field">
            <span>Payment method</span>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
              <option value="MTN_MOMO">MTN MoMo</option>
              <option value="AIRTEL_MONEY">Airtel Money</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </label>

          <label className="field">
            <span>Reference number</span>
            <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
          </label>

          <label className="field">
            <span>Verification notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : (<><CheckCircle2 className="btn-icon" />Confirm payment</>)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
