import env from '../lib/env.js';

export type EmailTemplateKey = 'registration-received' | 'payment-confirmed' | 'payment-reminder' | 'event-reminder' | 'manual';

function eventTitle() {
  return 'IEEE East Africa Humanitarian Technology Summit 2027';
}

function eventDetails() {
  return '14–16 January 2027<br />Kigali, Rwanda';
}

function registrationReceivedHtml({
  participantName,
  participantType,
  country,
  organization,
  paymentStatus,
}: {
  participantName: string;
  participantType: string;
  country: string;
  organization: string;
  paymentStatus: string;
}) {
  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#003366;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0;">
        <tr>
          <td style="padding:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfeaf4;">
              <tr>
                <td style="background:linear-gradient(135deg,#006699,#003366);padding:28px 30px;color:#ffffff;">
                  <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:bold;opacity:0.9;">IEEE East Africa</div>
                  <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">Registration Received</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;">
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Dear ${participantName},</p>
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Thank you for registering for the IEEE East Africa Humanitarian Technology Summit 2027. Your registration has been received and is currently being reviewed by the organizing committee.</p>
                  <table role="presentation" cellpadding="10" cellspacing="0" width="100%" style="background:#edf5fb;border:1px solid #dfeaf4;border-radius:12px;margin:18px 0;">
                    <tr><td style="font-weight:bold;color:#003366;width:180px;">Participant:</td><td style="color:#003366;">${participantName}</td></tr>
                    <tr><td style="font-weight:bold;color:#003366;">Participant type:</td><td style="color:#003366;">${participantType}</td></tr>
                    <tr><td style="font-weight:bold;color:#003366;">Country:</td><td style="color:#003366;">${country}</td></tr>
                    <tr><td style="font-weight:bold;color:#003366;">Organization:</td><td style="color:#003366;">${organization}</td></tr>
                    <tr><td style="font-weight:bold;color:#003366;">Payment status:</td><td style="color:#003366;">${paymentStatus}</td></tr>
                  </table>
                  <div style="background:#006699;padding:20px 18px;border-radius:12px;color:#ffffff;margin:18px 0;">
                    <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9;">Event</div>
                    <div style="margin-top:8px;font-size:20px;font-weight:bold;">${eventTitle()}</div>
                    <div style="margin-top:8px;font-size:15px;line-height:1.6;">${eventDetails()}</div>
                  </div>
                  <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#003366;">We will share further updates and payment instructions with you soon.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 30px 28px;background:#f6f9fc;border-top:1px solid #dfeaf4;color:#003366;">
                  <div style="font-size:12px;line-height:1.7;">
                    <strong>IEEE East Africa Humanitarian Technology Summit 2027</strong><br />
                    Kigali, Rwanda<br />
                    Innovate • Connect • Impact
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function paymentConfirmedHtml(participantName: string) {
  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#003366;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0;">
        <tr>
          <td style="padding:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfeaf4;">
              <tr>
                <td style="background:linear-gradient(135deg,#006699,#003366);padding:28px 30px;color:#ffffff;">
                  <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:bold;opacity:0.9;">IEEE East Africa</div>
                  <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">Payment Confirmed</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;">
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Dear ${participantName},</p>
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Your payment for the IEEE East Africa Humanitarian Technology Summit 2027 has been confirmed. We look forward to welcoming you to Kigali, Rwanda.</p>
                  <div style="background:#eef7ee;border:1px solid #cfe8d0;border-radius:12px;padding:18px 20px;color:#003366;margin:18px 0;">
                    <strong style="color:#006699;">Confirmation:</strong> Your registration is now fully confirmed.
                  </div>
                  <div style="background:#006699;padding:20px 18px;border-radius:12px;color:#ffffff;margin:18px 0;">
                    <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9;">Event</div>
                    <div style="margin-top:8px;font-size:20px;font-weight:bold;">${eventTitle()}</div>
                    <div style="margin-top:8px;font-size:15px;line-height:1.6;">${eventDetails()}</div>
                  </div>
                  <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#003366;">Next steps: please keep an eye on your inbox for programme announcements and travel information.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 30px 28px;background:#f6f9fc;border-top:1px solid #dfeaf4;color:#003366;">
                  <div style="font-size:12px;line-height:1.7;">
                    <strong>IEEE East Africa Humanitarian Technology Summit 2027</strong><br />
                    Kigali, Rwanda<br />
                    Innovate • Connect • Impact
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function paymentReminderHtml(participantName: string) {
  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#003366;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0;">
        <tr>
          <td style="padding:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfeaf4;">
              <tr>
                <td style="background:linear-gradient(135deg,#006699,#003366);padding:28px 30px;color:#ffffff;">
                  <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:bold;opacity:0.9;">IEEE East Africa</div>
                  <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">Payment Reminder</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;">
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Dear ${participantName},</p>
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">This is a friendly reminder that your registration is still pending payment. Please complete the registration payment to confirm your place at the summit.</p>
                  <div style="background:#fff4e5;border:1px solid #f2d5a6;border-radius:12px;padding:18px 20px;color:#003366;margin:18px 0;">
                    <strong style="color:#B31B1B;">Action required:</strong> Upload or provide proof of payment to the finance team as soon as possible.
                  </div>
                  <div style="background:#006699;padding:20px 18px;border-radius:12px;color:#ffffff;margin:18px 0;">
                    <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9;">Event</div>
                    <div style="margin-top:8px;font-size:20px;font-weight:bold;">${eventTitle()}</div>
                    <div style="margin-top:8px;font-size:15px;line-height:1.6;">${eventDetails()}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 30px 28px;background:#f6f9fc;border-top:1px solid #dfeaf4;color:#003366;">
                  <div style="font-size:12px;line-height:1.7;">
                    <strong>IEEE East Africa Humanitarian Technology Summit 2027</strong><br />
                    Kigali, Rwanda<br />
                    Innovate • Connect • Impact
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function eventReminderHtml(participantName: string) {
  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#003366;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0;">
        <tr>
          <td style="padding:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfeaf4;">
              <tr>
                <td style="background:linear-gradient(135deg,#006699,#003366);padding:28px 30px;color:#ffffff;">
                  <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:bold;opacity:0.9;">IEEE East Africa</div>
                  <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">Event Reminder</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;">
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Dear ${participantName},</p>
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">This is a reminder that the IEEE East Africa Humanitarian Technology Summit 2027 is just around the corner. We are looking forward to your participation.</p>
                  <div style="background:#006699;padding:20px 18px;border-radius:12px;color:#ffffff;margin:18px 0;">
                    <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9;">Event</div>
                    <div style="margin-top:8px;font-size:20px;font-weight:bold;">${eventTitle()}</div>
                    <div style="margin-top:8px;font-size:15px;line-height:1.6;">${eventDetails()}</div>
                  </div>
                  <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#003366;">Prepare for three days of innovation, collaboration, and impact across East Africa.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 30px 28px;background:#f6f9fc;border-top:1px solid #dfeaf4;color:#003366;">
                  <div style="font-size:12px;line-height:1.7;">
                    <strong>IEEE East Africa Humanitarian Technology Summit 2027</strong><br />
                    Kigali, Rwanda<br />
                    Innovate • Connect • Impact
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function manualMessageHtml({
  name,
  subject,
  message,
}: {
  name: string;
  subject: string;
  message: string;
}) {
  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#003366;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0;">
        <tr>
          <td style="padding:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfeaf4;">
              <tr>
                <td style="background:linear-gradient(135deg,#006699,#003366);padding:28px 30px;color:#ffffff;">
                  <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:bold;opacity:0.9;">IEEE East Africa</div>
                  <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">${subject}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;">
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Dear ${name},</p>
                  <div style="font-size:16px;line-height:1.75;color:#003366;">
                    ${message.replace(/\n/g, '<br />')}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 30px 28px;background:#f6f9fc;border-top:1px solid #dfeaf4;color:#003366;font-size:12px;line-height:1.7;">
                  <strong>IEEE East Africa Humanitarian Technology Summit 2027</strong><br />
                  Kigali, Rwanda<br />
                  Innovate • Connect • Impact
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function getTemplateHtml(template: EmailTemplateKey, payload: Record<string, string>, message?: string, subject?: string) {
  switch (template) {
    case 'registration-received':
      return registrationReceivedHtml({
        participantName: payload.participantName ?? 'Participant',
        participantType: payload.participantType ?? 'Local',
        country: payload.country ?? 'Rwanda',
        organization: payload.organization ?? 'Not provided',
        paymentStatus: payload.paymentStatus ?? 'Pending',
      });
    case 'payment-confirmed':
      return paymentConfirmedHtml(payload.participantName ?? 'Participant');
    case 'payment-reminder':
      return paymentReminderHtml(payload.participantName ?? 'Participant');
    case 'event-reminder':
      return eventReminderHtml(payload.participantName ?? 'Participant');
    case 'manual':
      return manualMessageHtml({
        name: payload.name ?? payload.participantName ?? 'Participant',
        subject: subject ?? 'Message from IEEE EA-HTS',
        message: message ?? '',
      });
    default:
      return registrationReceivedHtml({
        participantName: payload.participantName ?? 'Participant',
        participantType: payload.participantType ?? 'Local',
        country: payload.country ?? 'Rwanda',
        organization: payload.organization ?? 'Not provided',
        paymentStatus: payload.paymentStatus ?? 'Pending',
      });
  }
}

export async function sendBrevoEmail({
  to,
  name,
  subject,
  template,
  payload,
  message,
}: {
  to: string;
  name: string;
  subject: string;
  template: EmailTemplateKey;
  payload: Record<string, string>;
  message?: string;
}) {
  const html = getTemplateHtml(template, payload, message, subject);

  if (!env.BREVO_API_KEY) {
    return {
      preview: true,
      messageId: `preview-${Date.now()}`,
      html,
    };
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: 'IEEE EA-HTS 2027',
        email: env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: to, name }],
      subject,
      htmlContent: html,
      textContent: subject,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to send Brevo email.');
  }

  return response.json();
}
