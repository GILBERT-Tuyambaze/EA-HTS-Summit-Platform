import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CreditCard, Loader2, Mail, ShieldCheck, Smartphone, UserRound } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';
import { useProgress } from '../contexts/ProgressContext';
import { countries } from '../data/countries';
import { participantOptions, paymentConfig, type ParticipantType } from '../data/paymentConfig';
import { createRegistration } from '../services/registrationService';
import '../styles/register.css';

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  organization: string;
  ieeeMember: 'Yes' | 'No';
  participantType: ParticipantType;
  privacyAccepted: boolean;
};

const initialForm: FormState = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  organization: '',
  ieeeMember: 'No',
  participantType: 'Local',
  privacyAccepted: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d\s-]{7,20}$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showPopup } = usePopup();
  const { openProgress, updateProgress, closeProgress } = useProgress();

  const paymentInfo = useMemo(() => paymentConfig[form.participantType], [form.participantType]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const validateField = (field: keyof FormState, value: string | boolean) => {
    const nextErrors: Record<string, string> = { ...errors };

    if (field === 'fullName' && !String(value).trim()) {
      nextErrors.fullName = 'Full name is required.';
    } else if (field === 'fullName') {
      delete nextErrors.fullName;
    }

    if (field === 'email') {
      const emailValue = String(value).trim();
      if (!emailValue) {
        nextErrors.email = 'Email address is required.';
      } else if (!emailPattern.test(emailValue)) {
        nextErrors.email = 'Please enter a valid email address.';
      } else {
        delete nextErrors.email;
      }
    }

    if (field === 'phone') {
      const phoneValue = String(value).trim();
      if (!phoneValue) {
        nextErrors.phone = 'Phone number is required.';
      } else if (!phonePattern.test(phoneValue)) {
        nextErrors.phone = 'Please enter a valid phone number.';
      } else {
        delete nextErrors.phone;
      }
    }

    if (field === 'country' && !String(value).trim()) {
      nextErrors.country = 'Country is required.';
    } else if (field === 'country') {
      delete nextErrors.country;
    }

    if (field === 'privacyAccepted' && !value) {
      nextErrors.privacyAccepted = 'You must agree to the IEEE Privacy Policy.';
    } else if (field === 'privacyAccepted') {
      delete nextErrors.privacyAccepted;
    }

    setErrors(nextErrors);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked } = event.target as HTMLInputElement;
    const safeValue = type === 'checkbox' ? checked : value;

    setForm((current) => ({
      ...current,
      [name]: safeValue,
    }));

    if (type === 'checkbox' || name === 'fullName' || name === 'email' || name === 'phone' || name === 'country' || name === 'privacyAccepted') {
      validateField(name as keyof FormState, safeValue);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email address is required.';
    else if (!emailPattern.test(form.email.trim())) nextErrors.email = 'Please enter a valid email address.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    else if (!phonePattern.test(form.phone.trim())) nextErrors.phone = 'Please enter a valid phone number.';
    if (!form.country.trim()) nextErrors.country = 'Country is required.';
    if (!form.privacyAccepted) nextErrors.privacyAccepted = 'You must agree to the IEEE Privacy Policy.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      showPopup({
        type: 'error',
        message: 'Please complete the required fields before submitting.',
      });
      return;
    }

    setIsSubmitting(true);
    openProgress({
      title: 'Completing registration',
      description: 'Please wait, this may take a few seconds...',
      progress: 15,
      steps: [
        { label: 'Validating information', status: 'complete' },
        { label: 'Checking availability', status: 'active' },
        { label: 'Saving registration', status: 'pending' },
        { label: 'Sending confirmation', status: 'pending' },
      ],
    });

    try {
      updateProgress({
        progress: 30,
        steps: [
          { label: 'Validating information', status: 'complete' },
          { label: 'Checking availability', status: 'complete' },
          { label: 'Saving registration', status: 'active' },
          { label: 'Sending confirmation', status: 'pending' },
        ],
      });
      const createdRegistration = await createRegistration({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        organization: form.organization.trim(),
        ieeeMember: form.ieeeMember === 'Yes',
        participantType: form.participantType,
        paymentStatus: 'Pending',
        paymentMethod: '',
        paymentReference: '',
        notes: '',
      });

      sessionStorage.setItem('eahts-registration-success-v1', JSON.stringify({
        registrationNumber: createdRegistration.registrationNumber,
        fullName: createdRegistration.fullName,
        participantType: createdRegistration.participantType,
        country: createdRegistration.country,
        email: createdRegistration.email,
      }));

      setForm(initialForm);
      setErrors({});
      updateProgress({
        progress: 100,
        steps: [
          { label: 'Validating information', status: 'complete' },
          { label: 'Checking availability', status: 'complete' },
          { label: 'Saving registration', status: 'complete' },
          { label: 'Sending confirmation', status: 'complete' },
        ],
      });
      setTimeout(() => {
        closeProgress();
        showPopup({
          type: 'success',
          message: 'Registration received successfully. You are being redirected to your confirmation page.',
        });
        navigate('/register/success');
      }, 450);
    } catch (error) {
      closeProgress();
      const message = error instanceof Error ? error.message : 'Something went wrong while submitting your registration.';
      showPopup({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="register-page">
        <section className="register-hero">
          <div className="container register-hero-inner">
            <div className="register-hero-copy">
              <p className="eyebrow">Registration</p>
              <h1>Register for EA-HTS 2027</h1>
              <p>Join IEEE’s flagship humanitarian technology event in Kigali and connect with researchers, practitioners, startups, and policymakers working to build resilient communities.</p>
            </div>
            <div className="register-hero-card">
              <div className="register-hero-item"><UserRound /> <span>27–29 January 2027</span></div>
              <div className="register-hero-item"><Mail /> <span>Kigali, Rwanda</span></div>
              <div className="register-hero-item"><ShieldCheck /> <span>Innovate • Connect • Impact</span></div>
            </div>
          </div>
        </section>

        <section className="container register-section">
          <div className="register-grid">
            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="form-header">
                <h2>Participant registration</h2>
                <p>Complete the form below to reserve your place at the event.</p>
              </div>

              <div className="field-grid two-up">
                <label className="field">
                  <span>Full Name</span>
                  <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" />
                  {errors.fullName && <small>{errors.fullName}</small>}
                </label>

                <label className="field">
                  <span>Email Address</span>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@example.com" />
                  {errors.email && <small>{errors.email}</small>}
                </label>
              </div>

              <div className="field-grid two-up">
                <label className="field">
                  <span>Phone Number</span>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+250 7xx xxx xxx" />
                  {errors.phone && <small>{errors.phone}</small>}
                </label>

                <label className="field">
                  <span>Country</span>
                  <select name="country" value={form.country} onChange={handleChange}>
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors.country && <small>{errors.country}</small>}
                </label>
              </div>

              <div className="field-grid two-up">
                <label className="field">
                  <span>IEEE Member?</span>
                  <select name="ieeeMember" value={form.ieeeMember} onChange={handleChange}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>

                <label className="field">
                  <span>Participant Type</span>
                  <select name="participantType" value={form.participantType} onChange={handleChange}>
                    {participantOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Organization / Affiliation</span>
                <input name="organization" value={form.organization} onChange={handleChange} placeholder="Optional" />
              </label>

              <div className="payment-panel">
                <div className="payment-panel-header">
                  <CreditCard />
                  <div>
                    <p>Payment information</p>
                    <h3>{paymentInfo.instructionTitle}</h3>
                  </div>
                </div>

                <div className="payment-detail-grid">
                  {paymentInfo.details.map((detail) => (
                    <div className="payment-detail" key={detail.key}>
                      <label>{detail.label}</label>
                      <p>{detail.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <label className="checkbox-row">
                <input type="checkbox" name="privacyAccepted" checked={form.privacyAccepted} onChange={handleChange} />
                <span>I agree to the IEEE Privacy Policy</span>
              </label>
              {errors.privacyAccepted && <small className="checkbox-error">{errors.privacyAccepted}</small>}


              <button type="submit" className="btn btn-primary register-submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="btn-icon btn-spinner" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register Now
                    <ArrowRight className="btn-icon" />
                  </>
                )}
              </button>
            </form>

            <aside className="register-sidebar">
              <div className="info-card">
                <p className="eyebrow dark">Event overview</p>
                <h3>IEEE East Africa Humanitarian Technology Summit 2027</h3>
                <ul>
                  <li>27–29 January 2027</li>
                  <li>Kigali, Rwanda</li>
                  <li>Innovate · Connect · Impact</li>
                </ul>
              </div>

              <div className="info-card highlight">
                <p className="eyebrow dark">Who attends</p>
                <h3>Researchers, engineers, professionals, students, and mission-driven organizations</h3>
                <p>Bring your ideas, partnerships, and regional perspective to a summit designed around practical impact.</p>
              </div>

              <div className="info-card">
                <p className="eyebrow dark">Safe & secure</p>
                <h3>No card payments are collected on this site.</h3>
                <p>Payment is handled manually through the official event instructions shown above to ensure privacy and compliance.</p>
              </div>
            </aside>
          </div>
        </section>
    </main>
  );
}
