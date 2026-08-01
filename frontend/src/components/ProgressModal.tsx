import { CheckCircle2, Circle, CircleDot, X } from 'lucide-react';
import type { ProgressStep } from '../contexts/ProgressContext';

type ProgressModalProps = {
  title: string;
  description: string;
  progress: number;
  steps: ProgressStep[];
  onClose: () => void;
};

function renderIcon(status: ProgressStep['status']) {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="step-icon complete" />;
    case 'active':
      return <CircleDot className="step-icon active" />;
    case 'error':
      return <X className="step-icon error" />;
    default:
      return <Circle className="step-icon pending" />;
  }
}

export default function ProgressModal({ title, description, progress, steps, onClose }: ProgressModalProps) {
  const normalized = Math.min(100, Math.max(0, progress));
  const completedSteps = steps.filter((step) => step.status === 'complete').length;
  const hasError = steps.some((step) => step.status === 'error');
  const isComplete = steps.length > 0 && steps.every((step) => step.status === 'complete');

  if (isComplete || hasError) {
    return (
      <div className="progress-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="progress-modal-title">
        <div className="progress-final-card">
          <div className={`final-icon ${hasError ? 'error' : 'success'}`}>
            {hasError ? <X /> : <CheckCircle2 />}
          </div>

          <div className="progress-final-body">
            <h2>{hasError ? 'Something went wrong' : 'Operation completed'}</h2>
            <p>{hasError ? 'We could not complete this request. Please review the details and try again.' : 'The operation finished successfully. Your command has been processed.'}</p>
            <p className="progress-final-detail">{completedSteps}/{steps.length} steps completed</p>
            <button type="button" className="btn btn-primary progress-final-button" onClick={onClose}>
              {hasError ? 'Try again' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="progress-modal-title">
      <div className="progress-modal-card">
        <div className="progress-modal-header">
          <div>
            <p className="popup-message-title">{title}</p>
            <p className="progress-modal-subtitle">{description}</p>
          </div>
          <button type="button" className="popup-close-button" onClick={onClose} aria-label="Close progress modal">
            <X />
          </button>
        </div>

        <div className="progress-modal-content">
          <div className="progress-steps">
            {steps.map((step) => (
              <div key={step.label} className={`progress-step ${step.status}`}>
                <div className="progress-step-icon">{renderIcon(step.status)}</div>
                <div>
                  <p className="step-label">{step.label}</p>
                  {step.subtitle ? <p className="step-subtitle">{step.subtitle}</p> : null}
                </div>
              </div>
            ))}
          </div>

          <div className="progress-bar-shell">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${normalized}%` }} />
            </div>
            <div className="progress-bar-footer">
              <span>{normalized}% complete</span>
              <span>{completedSteps}/{steps.length} steps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
