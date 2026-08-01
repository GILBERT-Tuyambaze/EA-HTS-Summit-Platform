import { AppError } from '../lib/errors.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { EmailLogEntry, logEmailSend } from './emailLogService.js';
import { sendBrevoEmail } from './brevoService.js';

export type EmailQueueItem = {
  registrationId: string | null;
  to: string;
  name: string;
  subject: string;
  template: string;
  payload: Record<string, string>;
  sentBy: string;
  message?: string;
};

export async function sendQueuedEmail(item: EmailQueueItem) {
  try {
    const result = await sendBrevoEmail({
      to: item.to,
      name: item.name,
      subject: item.subject,
      template: item.template as any,
      payload: item.payload,
      message: item.message,
    });

    await logEmailSend({
      registrationId: item.registrationId,
      recipientEmail: item.to,
      recipientName: item.name,
      emailType: item.template,
      templateUsed: item.template,
      subject: item.subject,
      brevoMessageId: result.messageId ?? null,
      status: 'sent',
      sentBy: item.sentBy,
      errorMessage: null,
    });

    return result;
  } catch (error) {
    await logEmailSend({
      registrationId: item.registrationId,
      recipientEmail: item.to,
      recipientName: item.name,
      emailType: item.template,
      templateUsed: item.template,
      subject: item.subject,
      brevoMessageId: null,
      status: 'failed',
      sentBy: item.sentBy,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new AppError(error instanceof Error ? error.message : 'Failed to send queued email.', 500);
  }
}

export async function sendBulkEmails(items: EmailQueueItem[]) {
  const results = [];

  for (const item of items) {
    try {
      const result = await sendQueuedEmail(item);
      results.push({ registrationId: item.registrationId, status: 'sent', messageId: result.messageId ?? null });
    } catch (error) {
      results.push({ registrationId: item.registrationId, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return results;
}
