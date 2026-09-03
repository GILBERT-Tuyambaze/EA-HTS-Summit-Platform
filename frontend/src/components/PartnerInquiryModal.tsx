import { useState } from 'react';
import { X } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';
import { countries } from '../data/countries';

type InquiryType = 'partnership' | 'side-event' | 'challenge';

type PartnerInquiryModalProps = {
  open: boolean;
  onClose: () => void;
  type?: InquiryType;
};

export default function PartnerInquiryModal({ open, onClose, type = 'partnership' }: PartnerInquiryModalProps) {
  const { showPopup } = usePopup();
  const [form, setForm] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    country: '',
    details: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const endpointMap = {
    partnership: '/partner-inquiries',
    'side-event': '/side-event-proposals',
    challenge: '/challenge-applications',
  } as const;

  const copyMap = {
    partnership: {
      badge: 'Partnership request',
      title: 'Partner with EA-HTS 2027',
      description: 'Tell us about your organization and the kind of collaboration you would like to explore.',
      detailLabel: 'How would you like to partner?',
      placeholder: 'Share your idea, sponsorship interest, or collaboration plans',
    },
    'side-event': {
      badge: 'Side event proposal',
      title: 'Propose a side event',
      description: 'Share the idea, audience, and format for your session or forum.',
      detailLabel: 'What would your side event focus on?',
      placeholder: 'Describe the theme, audience, goals, and format for your proposed session',
    },
    challenge: {
      badge: 'Startup challenge',
      title: 'Apply to the challenge',
      description: 'Tell us about your team, solution, and the impact you are creating.',
      detailLabel: 'Tell us about your startup or application',
      placeholder: 'Share your solution, problem area, traction, and why it matters for East Africa',
    },
  } as const;

  const currentCopy = copyMap[type];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}${endpointMap[type]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          organization: form.organization.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          country: form.country.trim() || null,
          details: form.details.trim() || null,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'We could not submit your request right now.');
      }

      // If the server returned a warning (partial failure), surface that to the user
      if (payload?.warning) {
        setForm({ name: '', organization: '', email: '', phone: '', country: '', details: '' });
        showPopup({
          type: 'info',
          title: 'Saved with warning',
          message: payload.warning,
        });
        onClose();
        return;
      }

      setForm({ name: '', organization: '', email: '', phone: '', country: '', details: '' });
      showPopup({
        type: 'success',
        title: 'Request received',
        message: 'Thank you for reaching out. We received your partnership request and will follow up shortly.',
      });
      onClose();
    } catch (error) {
      showPopup({
        type: 'error',
        title: 'Submission failed',
        message: error instanceof Error ? error.message : 'We could not submit your request right now.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="partner-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="partner-modal-title" onClick={onClose}>
      <div className="partner-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="partner-modal-glow glow-one" />
        <div className="partner-modal-glow glow-two" />

        <div className="partner-modal-header">
          <div className="partner-modal-heading">
            <span className="partner-modal-badge">{currentCopy.badge}</span>
            <h3 id="partner-modal-title">{currentCopy.title}</h3>
            <p>{currentCopy.description}</p>
          </div>
          <button type="button" className="partner-modal-close" onClick={onClose} aria-label="Close partner request form">
            <X size={18} />
          </button>
        </div>

        <form className="partner-modal-form" onSubmit={handleSubmit}>
          <label className="partner-field">
            <span>Full name <b>*</b></span>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />
          </label>
          <label className="partner-field">
            <span>Email address <b>*</b></span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jane@example.com" />
          </label>
          <label className="partner-field">
            <span>Organization <b>*</b></span>
            <input name="organization" value={form.organization} onChange={handleChange} required placeholder="Tech Foundation" />
          </label>
          <label className="partner-field">
            <span>Country <b>*</b></span>
            <select name="country" value={form.country} onChange={handleChange} required>
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </label>
          <label className="partner-field partner-field-full">
            <span>Phone number <em>(Optional)</em></span>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+250 788 000 000" />
          </label>
          <label className="partner-field partner-field-textarea">
            <span>{currentCopy.detailLabel}</span>
            <textarea name="details" value={form.details} onChange={handleChange} required placeholder={currentCopy.placeholder} rows={3} />
          </label>

          <div className="partner-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
