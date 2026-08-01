import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';
import { logAuditEvent } from './auditService.js';

export type SessionInput = {
  title: string;
  description?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  track: string;
  speaker_id?: string | null;
};

export type SpeakerInput = {
  name: string;
  organization?: string | null;
  email?: string | null;
  biography?: string | null;
  image?: string | null;
};

const fail = (error: unknown) => {
  if (error) throw new AppError((error as { message?: string }).message ?? 'Database operation failed.', 500);
};

const ensureId = (id: string) => {
  if (!id) throw new AppError('A valid identifier is required.', 400);
};

export async function listSessions() {
  const { data, error } = await supabaseAdmin.from('sessions').select('*, speakers(name)').order('start_time');
  fail(error);
  return (data ?? []) as any[];
}

export async function createSession(input: SessionInput, adminId?: string) {
  const { data, error } = await supabaseAdmin.from('sessions').insert({
    title: input.title,
    description: input.description ?? null,
    date: input.date,
    start_time: input.start_time,
    end_time: input.end_time,
    location: input.location,
    track: input.track,
    speaker_id: input.speaker_id ?? null,
  }).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'program.session_created', target: `session:${data.id}`, metadata: { title: data.title, track: data.track } });
  }
  return data as any;
}

export async function updateSession(id: string, input: Partial<SessionInput>, adminId?: string) {
  ensureId(id);
  const { data, error } = await supabaseAdmin.from('sessions').update(input).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'program.session_updated', target: `session:${data.id}`, metadata: { title: data.title, track: data.track } });
  }
  return data as any;
}

export async function deleteSession(id: string, adminId?: string) {
  ensureId(id);
  const { data: existing, error: existingError } = await supabaseAdmin.from('sessions').select('*').eq('id', id).maybeSingle();
  fail(existingError);
  if (!existing) throw new AppError('Session not found.', 404);
  const { error } = await supabaseAdmin.from('sessions').delete().eq('id', id);
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'program.session_deleted', target: `session:${id}`, metadata: { title: existing.title } });
  }
}

export async function listSpeakers() {
  const { data, error } = await supabaseAdmin.from('speakers').select('*').order('name');
  fail(error);
  return (data ?? []) as any[];
}

export async function createSpeaker(input: SpeakerInput, adminId?: string) {
  const { data, error } = await supabaseAdmin.from('speakers').insert({
    name: input.name,
    organization: input.organization ?? null,
    email: input.email ?? null,
    biography: input.biography ?? null,
    image: input.image ?? null,
  }).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'program.speaker_created', target: `speaker:${data.id}`, metadata: { name: data.name, organization: data.organization } });
  }
  return data as any;
}

export async function updateSpeaker(id: string, input: Partial<SpeakerInput>, adminId?: string) {
  ensureId(id);
  const { data, error } = await supabaseAdmin.from('speakers').update(input).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'program.speaker_updated', target: `speaker:${data.id}`, metadata: { name: data.name } });
  }
  return data as any;
}

export async function deleteSpeaker(id: string, adminId?: string) {
  ensureId(id);
  const { data: existing, error: existingError } = await supabaseAdmin.from('speakers').select('*').eq('id', id).maybeSingle();
  fail(existingError);
  if (!existing) throw new AppError('Speaker not found.', 404);
  const { error } = await supabaseAdmin.from('speakers').delete().eq('id', id);
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'program.speaker_deleted', target: `speaker:${id}`, metadata: { name: existing.name } });
  }
}

export async function getProgramStats() {
  const [sessions, speakers] = await Promise.all([listSessions(), listSpeakers()]);
  return {
    sessions: sessions.length,
    speakers: speakers.length,
    tracks: new Set(sessions.map((x: any) => x.track)).size,
    rooms: new Set(sessions.map((x: any) => x.location ?? x.room)).size,
  };
}

