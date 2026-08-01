import { type RegistrationRecord } from './registrationService';
import { registrationReceivedTemplate, paymentConfirmedTemplate, paymentReminderTemplate, eventReminderTemplate } from '../data/emailTemplates';

export type EmailTemplateName = 'registration-received' | 'payment-confirmed' | 'payment-reminder' | 'event-reminder';

export type EmailRequest = {
  to: string;
  name: string;
  subject: string;
  template: EmailTemplateName;
  registration?: RegistrationRecord;
};

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

function getHtmlForTemplate(template: EmailTemplateName, registration?: RegistrationRecord) {
  const data = {
    name: registration?.fullName ?? 'Participant',
    participantType: registration?.participantType ?? 'Local',
    country: registration?.country ?? 'Rwanda',
    organization: registration?.organization ?? 'Not provided',
    paymentStatus: registration?.paymentStatus ?? 'Pending',
  };

  switch (template) {
    case 'registration-received':
      return registrationReceivedTemplate(data.name, data.participantType, data.country, data.organization, data.paymentStatus);
    case 'payment-confirmed':
      return paymentConfirmedTemplate(data.name);
    case 'payment-reminder':
      return paymentReminderTemplate(data.name);
    case 'event-reminder':
      return eventReminderTemplate(data.name);
    default:
      return registrationReceivedTemplate(data.name, data.participantType, data.country, data.organization, data.paymentStatus);
  }
}

export async function sendEmailTemplate({ to, name, subject, template, registration }: EmailRequest) {
  const apiKey = import.meta.env.VITE_BREVO_API_KEY;
  const senderEmail = import.meta.env.VITE_BREVO_SENDER_EMAIL ?? 'noreply@example.com';
  const html = getHtmlForTemplate(template, registration);

  if (!apiKey) {
    console.info(`[Email preview] ${subject} -> ${to}`, { html });
    return { preview: true, messageId: `preview-${Date.now()}` };
  }

  const response = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: 'IEEE EA-HTS 2027', email: senderEmail },
      to: [{ email: to, name }],
      subject,
      htmlContent: html,
      textContent: subject,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to send email via Brevo.');
  }

  return response.json();
}

export async function sendRegistrationReceivedEmail(registration: RegistrationRecord) {
  return sendEmailTemplate({
    to: registration.email,
    name: registration.fullName,
    subject: 'Registration received — IEEE East Africa Humanitarian Technology Summit 2027',
    template: 'registration-received',
    registration,
  });
}

export async function sendPaymentConfirmedEmail(registration: RegistrationRecord) {
  return sendEmailTemplate({
    to: registration.email,
    name: registration.fullName,
    subject: 'Payment confirmed — IEEE EA-HTS 2027',
    template: 'payment-confirmed',
    registration,
  });
}

export async function sendPaymentReminderEmail(registration: RegistrationRecord) {
  return sendEmailTemplate({
    to: registration.email,
    name: registration.fullName,
    subject: 'Payment reminder — IEEE EA-HTS 2027',
    template: 'payment-reminder',
    registration,
  });
}

export async function sendEventReminderEmail(registration: RegistrationRecord) {
  return sendEmailTemplate({
    to: registration.email,
    name: registration.fullName,
    subject: 'Event reminder — IEEE EA-HTS 2027',
    template: 'event-reminder',
    registration,
  });
}
