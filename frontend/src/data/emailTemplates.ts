const eventTitle = 'IEEE East Africa Humanitarian Technology Summit 2027';
const eventDetails = '14–16 January 2027<br />Kigali, Rwanda';

export function registrationReceivedTemplate(
  participantName: string,
  participantType: string,
  country: string,
  organization: string,
  paymentStatus: string,
) {
  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#003366;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfeaf4;">
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
                    <div style="margin-top:8px;font-size:20px;font-weight:bold;">${eventTitle}</div>
                    <div style="margin-top:8px;font-size:15px;line-height:1.6;">${eventDetails}</div>
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

export function paymentConfirmedTemplate(participantName: string) {
  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#003366;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfeaf4;">
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
                    <div style="margin-top:8px;font-size:20px;font-weight:bold;">${eventTitle}</div>
                    <div style="margin-top:8px;font-size:15px;line-height:1.6;">${eventDetails}</div>
                  </div>
                  <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#003366;">Next steps: please keep an eye on your inbox for speaker updates, programme announcements, and travel information.</p>
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

export function paymentReminderTemplate(participantName: string) {
  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#003366;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfeaf4;">
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
                    <div style="margin-top:8px;font-size:20px;font-weight:bold;">${eventTitle}</div>
                    <div style="margin-top:8px;font-size:15px;line-height:1.6;">${eventDetails}</div>
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

export function eventReminderTemplate(participantName: string) {
  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#003366;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfeaf4;">
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
                    <div style="margin-top:8px;font-size:20px;font-weight:bold;">${eventTitle}</div>
                    <div style="margin-top:8px;font-size:15px;line-height:1.6;">${eventDetails}</div>
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
