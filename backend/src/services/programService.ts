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
  speaker_id?: string | null; // kept for backward compatibility
  speaker_ids?: string[] | null; // new multi-speaker support
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
  const { data: sessions, error } = await supabaseAdmin.from('sessions').select('*').order('start_time');
  fail(error);
  const sessionList = (sessions ?? []) as any[];

  if (sessionList.length === 0) return sessionList;

  const ids = sessionList.map((s) => s.id);
  const { data: joins, error: joinError } = await supabaseAdmin
    .from('session_speakers')
    .select('session_id, speakers(id, name, organization, email, biography, image)')
    .in('session_id', ids);

  fail(joinError);

  const map: Record<string, any[]> = {};
  (joins ?? []).forEach((j: any) => {
    const sid = String(j.session_id);
    map[sid] = map[sid] ?? [];
    map[sid].push(j.speakers);
  });

  return sessionList.map((s) => ({ ...s, speakers: map[s.id] ?? [] }));
}

export async function createSession(input: SessionInput, adminId?: string) {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .insert({
      title: input.title,
      description: input.description ?? null,
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      location: input.location,
      track: input.track,
      speaker_id: input.speaker_id ?? null,
    })
    .select()
    .single();
  fail(error);

  // if speaker_ids provided, populate join table
  const speakerIds = Array.isArray(input.speaker_ids) ? input.speaker_ids : input.speaker_id ? [input.speaker_id] : [];
  if (speakerIds.length > 0) {
    const rows = speakerIds.map((sid) => ({ session_id: data.id, speaker_id: sid }));
    const { error: joinError } = await supabaseAdmin.from('session_speakers').insert(rows);
    fail(joinError);
  }

  if (adminId) {
    await logAuditEvent({ adminId, action: 'program.session_created', target: `session:${data.id}`, metadata: { title: data.title, track: data.track } });
  }
  // attach speakers to returned session
  const { data: withSpeakers, error: reloadErr } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('id', data.id)
    .single();
  fail(reloadErr);
  const { data: joins, error: joinErr } = await supabaseAdmin
    .from('session_speakers')
    .select('speakers(id, name, organization, email, biography, image)')
    .eq('session_id', data.id);
  fail(joinErr);
  return { ...withSpeakers, speakers: joins ?? [] } as any;
}

export async function updateSession(id: string, input: Partial<SessionInput>, adminId?: string) {
  ensureId(id);
  // handle speaker_ids updates separately
  const speakerIds = Array.isArray(input.speaker_ids) ? input.speaker_ids : input.speaker_id ? [input.speaker_id] : undefined;
  const toUpdate = { ...input } as any;
  delete toUpdate.speaker_ids;

  const { data, error } = await supabaseAdmin.from('sessions').update(toUpdate).eq('id', id).select().single();
  fail(error);

  if (Array.isArray(speakerIds)) {
    // remove existing entries
    const { error: delErr } = await supabaseAdmin.from('session_speakers').delete().eq('session_id', id);
    fail(delErr);
    if (speakerIds.length > 0) {
      const rows = speakerIds.map((sid) => ({ session_id: id, speaker_id: sid }));
      const { error: insErr } = await supabaseAdmin.from('session_speakers').insert(rows);
      fail(insErr);
    }
  }

  if (adminId) {
    await logAuditEvent({ adminId, action: 'program.session_updated', target: `session:${data.id}`, metadata: { title: data.title, track: data.track } });
  }

  // return session with attached speakers
  const { data: withSpeakers, error: reloadErr } = await supabaseAdmin.from('sessions').select('*').eq('id', id).single();
  fail(reloadErr);
  const { data: joins, error: joinErr } = await supabaseAdmin.from('session_speakers').select('speakers(id, name, organization, email, biography, image)').eq('session_id', id);
  fail(joinErr);
  return { ...withSpeakers, speakers: joins ?? [] } as any;
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

