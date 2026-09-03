import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';

export type EmailCategory =
  | 'participant'
  | 'speaker'
  | 'partner'
  | 'startup'
  | 'volunteer'
  | 'operations'
  | 'marketing'
  | 'system';

export type EmailTrigger =
  | 'manual'
  | 'registration_created'
  | 'payment_confirmed'
  | 'payment_reminder'
  | 'event_reminder'
  | 'speaker_invitation'
  | 'partner_invitation'
  | 'volunteer_assignment';

export type AudienceFilterCondition =
  | string
  | number
  | boolean
  | { not: string | number | boolean }
  | { in: Array<string | number | boolean> }
  | { notIn: Array<string | number | boolean> };

export type EmailAudience = {
  roles: EmailCategory[];
  filters?: Record<string, AudienceFilterCondition>;
};

export type EmailTemplateStatus = 'draft' | 'review' | 'approved' | 'active' | 'archived';

export type HeroBlock = {
  type: 'hero';
  title: string;
  subtitle?: string;
  image?: string;
};

export type TextBlock = {
  type: 'text';
  content: string;
};

export type ButtonBlock = {
  type: 'button';
  text: string;
  url: string;
};

export type RegistrationCardBlock = {
  type: 'registration_card';
  fields: string[];
};

export type TimelineBlock = {
  type: 'timeline';
  events: Array<{
    date: string;
    title: string;
    description?: string;
  }>;
};

export type SpeakerSessionBlock = {
  type: 'speaker_session';
  speaker: string;
  session: string;
  room: string;
};

export type FooterBlock = {
  type: 'footer';
  content: string;
};

export type EmailBlock =
  | HeroBlock
  | TextBlock
  | ButtonBlock
  | RegistrationCardBlock
  | TimelineBlock
  | SpeakerSessionBlock
  | FooterBlock;

export type EmailTemplate = {
  id: string;
  name: string;
  category: EmailCategory;
  audience: string;
  audience_json: EmailAudience;
  trigger: EmailTrigger;
  type: string;
  subject: string;
  preview_text?: string;
  html_content: string;
  blocks_json?: EmailBlock[];
  variables: string[];
  status: EmailTemplateStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type EmailTemplateVersion = {
  id: string;
  template_id: string;
  version_number: number;
  subject: string;
  preview_text?: string;
  blocks_json?: EmailBlock[];
  status: EmailTemplateStatus;
  created_by: string;
  created_at: string;
};

const defaultTemplates: Omit<EmailTemplate, 'created_at' | 'updated_at'>[] = [
  {
    id: 'registration-received',
    name: 'Registration Confirmation',
    category: 'participant',
    audience: 'Registrants',
    audience_json: { roles: ['participant'] },
    trigger: 'registration_created',
    type: 'registration-received',
    subject: 'Registration Confirmed — EA-HTS 2027',
    preview_text: 'Your registration is confirmed for the IEEE EA-HTS 2027 summit.',
    html_content: `
      <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#003366;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfeaf4;">
                <tr>
                  <td style="background:linear-gradient(135deg,#006699,#003366);padding:28px 30px;color:#ffffff;">
                    <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:bold;opacity:0.9;">IEEE East Africa</div>
                    <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">Registration Confirmed</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;">
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Dear {name},</p>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Thank you for registering for the IEEE East Africa Humanitarian Technology Summit 2027. Your registration has been received and confirmed.</p>
                    <table role="presentation" cellpadding="10" cellspacing="0" width="100%" style="background:#edf5fb;border:1px solid #dfeaf4;border-radius:12px;margin:18px 0;">
                      <tr><td style="font-weight:bold;color:#003366;width:180px;">Registration #</td><td style="color:#003366;">{registration_number}</td></tr>
                      <tr><td style="font-weight:bold;color:#003366;">Participant type</td><td style="color:#003366;">{participant_type}</td></tr>
                      <tr><td style="font-weight:bold;color:#003366;">Payment status</td><td style="color:#003366;">{payment_status}</td></tr>
                      <tr><td style="font-weight:bold;color:#003366;">Country</td><td style="color:#003366;">{country}</td></tr>
                    </table>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Important dates: 14–16 January 2027 in Kigali, Rwanda.</p>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">If you have questions, contact us at <a href="mailto:{support_email}" style="color:#006699;text-decoration:none;">{support_email}</a>.</p>
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
    `,
    variables: ['name', 'registration_number', 'participant_type', 'payment_status', 'country', 'support_email'],
    status: 'active',
    created_by: 'system',
  },
  {
    id: 'payment-confirmed',
    name: 'Payment Confirmation',
    category: 'participant',
    audience: 'Paid registrants',
    audience_json: { roles: ['participant'], filters: { payment_status: 'Paid' } },
    trigger: 'payment_confirmed',
    type: 'payment-confirmed',
    subject: 'Payment Confirmed — EA-HTS 2027 Registration',
    preview_text: 'Thank you — your payment has been confirmed for EA-HTS 2027.',
    html_content: `
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
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Dear {name},</p>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Your payment has been successfully verified.</p>
                    <table role="presentation" cellpadding="10" cellspacing="0" width="100%" style="background:#eef7ee;border:1px solid #cfe8d0;border-radius:12px;margin:18px 0;">
                      <tr><td style="font-weight:bold;color:#003366;width:180px;">Registration #</td><td style="color:#003366;">{registration_number}</td></tr>
                      <tr><td style="font-weight:bold;color:#003366;">Status</td><td style="color:#003366;">PAID</td></tr>
                      <tr><td style="font-weight:bold;color:#003366;">Reference</td><td style="color:#003366;">{payment_reference}</td></tr>
                    </table>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">We look forward to welcoming you to the summit. If you need assistance, please contact <a href="mailto:{support_email}" style="color:#006699;text-decoration:none;">{support_email}</a>.</p>
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
    `,
    variables: ['name', 'registration_number', 'payment_reference', 'support_email'],
    status: 'active',
    created_by: 'system',
  },
  {
    id: 'payment-reminder',
    name: 'Payment Reminder',
    category: 'participant',
    audience: 'Unpaid registrants',
    audience_json: { roles: ['participant'], filters: { payment_status: 'Pending' } },
    trigger: 'payment_reminder',
    type: 'payment-reminder',
    subject: 'Action Required: Complete Your EA-HTS 2027 Registration',
    preview_text: 'A friendly reminder to complete your EA-HTS 2027 registration payment.',
    html_content: `
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
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Dear {name},</p>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">This is a reminder that your EA-HTS summit registration payment is still pending. Please complete payment as soon as possible to confirm your participation.</p>
                    <div style="background:#fff4e5;border:1px solid #f2d5a6;border-radius:12px;padding:18px 20px;color:#003366;margin:18px 0;">
                      <strong style="color:#B31B1B;">Action required:</strong> Submit your payment before the deadline.
                    </div>
                    <table role="presentation" cellpadding="10" cellspacing="0" width="100%" style="background:#edf5fb;border:1px solid #dfeaf4;border-radius:12px;margin:18px 0;">
                      <tr><td style="font-weight:bold;color:#003366;width:180px;">Registration #</td><td style="color:#003366;">{registration_number}</td></tr>
                      <tr><td style="font-weight:bold;color:#003366;">Payment reference</td><td style="color:#003366;">{payment_reference}</td></tr>
                      <tr><td style="font-weight:bold;color:#003366;">Deadline</td><td style="color:#003366;">{deadline}</td></tr>
                    </table>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">For help, contact <a href="mailto:{support_email}" style="color:#006699;text-decoration:none;">{support_email}</a>.</p>
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
    `,
    variables: ['name', 'registration_number', 'payment_reference', 'deadline', 'support_email'],
    status: 'active',
    created_by: 'system',
  },
  {
    id: 'event-reminder',
    name: 'Event Reminder',
    category: 'participant',
    audience: 'All participants',
    audience_json: { roles: ['participant'] },
    trigger: 'event_reminder',
    type: 'event-reminder',
    subject: 'EA-HTS 2027 Event Reminder',
    preview_text: 'Reminder with key details for the EA-HTS 2027 summit.',
    html_content: `
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
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Dear {name},</p>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">The IEEE East Africa Humanitarian Technology Summit 2027 is approaching. Here are the details for the event.</p>
                    <table role="presentation" cellpadding="10" cellspacing="0" width="100%" style="background:#edf5fb;border:1px solid #dfeaf4;border-radius:12px;margin:18px 0;">
                      <tr><td style="font-weight:bold;color:#003366;width:180px;">Venue</td><td style="color:#003366;">{venue}</td></tr>
                      <tr><td style="font-weight:bold;color:#003366;">Dates</td><td style="color:#003366;">{event_date}</td></tr>
                      <tr><td style="font-weight:bold;color:#003366;">Programme</td><td style="color:#003366;"><a href="{programme_link}" style="color:#006699;text-decoration:none;">View programme</a></td></tr>
                    </table>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Please arrive early and plan your travel to Kigali. For questions, contact <a href="mailto:{support_email}" style="color:#006699;text-decoration:none;">{support_email}</a>.</p>
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
    `,
    variables: ['name', 'venue', 'event_date', 'programme_link', 'support_email'],
    status: 'active',
    created_by: 'system',
  },
];

export function renderEmailTemplate(templateHtml: string, payload: Record<string, string | undefined>) {
  return templateHtml.replace(/\{(\w+)\}/g, (_match, key) => String(payload[key] ?? ''));
}

export async function ensureEmailTemplates() {
  const { data, error } = await supabaseAdmin.from('email_templates').select('id');
  if (error) {
    throw new AppError(error.message, 500);
  }

  const existingIds = (data ?? []).map((row: any) => String(row.id));
  const toInsert = defaultTemplates.filter((template) => !existingIds.includes(template.id));

  if (toInsert.length === 0) {
    return;
  }

  const { error: insertError } = await supabaseAdmin.from('email_templates').insert(
    toInsert.map((template) => ({
      ...template,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  );

  if (insertError) {
    throw new AppError(insertError.message, 500);
  }
}

export const supportedEmailVariables = [
  'name',
  'email',
  'registration_number',
  'participant_type',
  'country',
  'payment_status',
  'payment_reference',
  'event_name',
  'event_date',
  'venue',
  'support_email',
  'deadline',
  'programme_link',
] as const;

export type SupportedEmailVariable = (typeof supportedEmailVariables)[number];

export async function getEmailTemplates() {
  await ensureEmailTemplates();

  const { data, error } = await supabaseAdmin.from('email_templates').select('*').order('name', { ascending: true });
  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data ?? []) as EmailTemplate[];
}

export async function getTemplates() {
  return getEmailTemplates();
}

export async function getEmailTemplateById(id: string) {
  await ensureEmailTemplates();

  const { data, error } = await supabaseAdmin.from('email_templates').select('*').eq('id', id).maybeSingle();
  if (error) {
    throw new AppError(error.message, 500);
  }

  return data as EmailTemplate | null;
}

export async function getTemplateByType(type: string) {
  await ensureEmailTemplates();

  const { data, error } = await supabaseAdmin.from('email_templates').select('*').eq('type', type).maybeSingle();
  if (error) {
    throw new AppError(error.message, 500);
  }

  return data as EmailTemplate | null;
}

export async function createTemplate(template: Omit<EmailTemplate, 'created_at' | 'updated_at'>) {
  const { data, error } = await supabaseAdmin.from('email_templates').insert({
    ...template,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select('*').single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data as EmailTemplate;
}

export async function createEmailTemplateVersion(version: Omit<EmailTemplateVersion, 'id' | 'created_at' | 'version_number'> & { version_number?: number }) {
  const { data, error } = await supabaseAdmin.from('email_template_versions').insert({
    ...version,
    version_number: version.version_number ?? 1,
    created_at: new Date().toISOString(),
  }).select('*').single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data as EmailTemplateVersion;
}

export async function getTemplateVersions(templateId: string) {
  const { data, error } = await supabaseAdmin.from('email_template_versions').select('*').eq('template_id', templateId).order('version_number', { ascending: false });
  if (error) {
    throw new AppError(error.message, 500);
  }
  return (data ?? []) as EmailTemplateVersion[];
}

export async function updateTemplate(id: string, updates: Partial<Omit<EmailTemplate, 'id' | 'created_at'>>) {
  const { data, error } = await supabaseAdmin.from('email_templates').update({
    ...updates,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select('*').single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data as EmailTemplate;
}

export function renderTemplate(templateHtml: string, variables: Record<string, string | undefined>) {
  return templateHtml.replace(/\{(\w+)\}/g, (_match, key) => {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      return String(variables[key] ?? '');
    }
    return '';
  });
}
