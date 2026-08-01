import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';
import { logAuditEvent } from './auditService.js';

export type VolunteerInput = {
  name: string;
  role: string;
  shift: string;
  contact: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  status?: string;
};

const fail = (error: unknown) => {
  if (error) throw new AppError((error as { message?: string }).message ?? 'Database operation failed.', 500);
};

const ensureId = (id: string) => {
  if (!id) throw new AppError('A valid identifier is required.', 400);
};

const list = (table: string) => async () => {
  const { data, error } = await supabaseAdmin.from(table).select('*').order('created_at', { ascending: false });
  fail(error);
  return (data ?? []) as any[];
};

export const listVolunteers = list('volunteers');
export const listVenues = list('venues');
export const listEquipment = list('equipment');
export const listTasks = list('tasks');
export const listIncidents = list('incidents');

export async function createVolunteer(input: VolunteerInput, adminId?: string) {
  const { data, error } = await supabaseAdmin
    .from('volunteers')
    .insert({ ...input, status: input.status ?? 'Active' })
    .select()
    .single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.volunteer_created', target: `volunteer:${data.id}`, metadata: { name: data.name, status: data.status } });
  }
  return data as any;
}

export async function updateVolunteer(id: string, input: Partial<VolunteerInput>, adminId?: string) {
  ensureId(id);
  const { data, error } = await supabaseAdmin.from('volunteers').update(input).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.volunteer_updated', target: `volunteer:${data.id}`, metadata: { status: data.status } });
  }
  return data as any;
}

export async function deleteVolunteer(id: string, adminId?: string) {
  ensureId(id);
  const { data: existing, error: existingError } = await supabaseAdmin.from('volunteers').select('*').eq('id', id).maybeSingle();
  fail(existingError);
  if (!existing) throw new AppError('Volunteer not found.', 404);
  const { error } = await supabaseAdmin.from('volunteers').delete().eq('id', id);
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.volunteer_deleted', target: `volunteer:${id}`, metadata: { name: existing.name } });
  }
}

export async function createVenue(input: { name: string; location?: string | null; capacity: number; status?: string; notes?: string | null }, adminId?: string) {
  const { data, error } = await supabaseAdmin.from('venues').insert({ ...input, status: input.status ?? 'pending' }).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.venue_created', target: `venue:${data.id}`, metadata: { name: data.name, status: data.status } });
  }
  return data as any;
}

export async function updateVenue(id: string, input: Record<string, unknown>, adminId?: string) {
  ensureId(id);
  const { data, error } = await supabaseAdmin.from('venues').update(input).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.venue_updated', target: `venue:${data.id}`, metadata: { status: data.status } });
  }
  return data as any;
}

export async function deleteVenue(id: string, adminId?: string) {
  ensureId(id);
  const { data: existing, error: existingError } = await supabaseAdmin.from('venues').select('*').eq('id', id).maybeSingle();
  fail(existingError);
  if (!existing) throw new AppError('Venue not found.', 404);
  const { error } = await supabaseAdmin.from('venues').delete().eq('id', id);
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.venue_deleted', target: `venue:${id}`, metadata: { name: existing.name } });
  }
}

export async function createEquipment(input: { name: string; quantity: number; status?: string; assigned_to?: string | null }, adminId?: string) {
  const { data, error } = await supabaseAdmin.from('equipment').insert({ ...input, status: input.status ?? 'pending' }).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.equipment_created', target: `equipment:${data.id}`, metadata: { name: data.name, quantity: data.quantity } });
  }
  return data as any;
}

export async function updateEquipment(id: string, input: Record<string, unknown>, adminId?: string) {
  ensureId(id);
  const { data, error } = await supabaseAdmin.from('equipment').update(input).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.equipment_updated', target: `equipment:${data.id}`, metadata: { status: data.status } });
  }
  return data as any;
}

export async function deleteEquipment(id: string, adminId?: string) {
  ensureId(id);
  const { data: existing, error: existingError } = await supabaseAdmin.from('equipment').select('*').eq('id', id).maybeSingle();
  fail(existingError);
  if (!existing) throw new AppError('Equipment not found.', 404);
  const { error } = await supabaseAdmin.from('equipment').delete().eq('id', id);
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.equipment_deleted', target: `equipment:${id}`, metadata: { name: existing.name } });
  }
}

export async function createTask(input: { title: string; description?: string | null; priority?: string; assigned_to?: string | null; status?: string; due_date?: string | null }, adminId?: string) {
  const { data, error } = await supabaseAdmin.from('tasks').insert({ ...input, status: input.status ?? 'pending', priority: input.priority ?? 'medium' }).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.task_created', target: `task:${data.id}`, metadata: { title: data.title, status: data.status } });
  }
  return data as any;
}

export async function updateTask(id: string, input: Record<string, unknown>, adminId?: string) {
  ensureId(id);
  const { data, error } = await supabaseAdmin.from('tasks').update(input).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.task_updated', target: `task:${data.id}`, metadata: { status: data.status } });
  }
  return data as any;
}

export async function deleteTask(id: string, adminId?: string) {
  ensureId(id);
  const { data: existing, error: existingError } = await supabaseAdmin.from('tasks').select('*').eq('id', id).maybeSingle();
  fail(existingError);
  if (!existing) throw new AppError('Task not found.', 404);
  const { error } = await supabaseAdmin.from('tasks').delete().eq('id', id);
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.task_deleted', target: `task:${id}`, metadata: { title: existing.title } });
  }
}

export async function createIncident(input: { title: string; description?: string | null; severity?: string; status?: string; assigned_to?: string | null }, adminId?: string) {
  const { data, error } = await supabaseAdmin.from('incidents').insert({ ...input, severity: input.severity ?? 'low', status: input.status ?? 'pending' }).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.incident_created', target: `incident:${data.id}`, metadata: { title: data.title, severity: data.severity } });
  }
  return data as any;
}

export async function updateIncident(id: string, input: Record<string, unknown>, adminId?: string) {
  ensureId(id);
  const { data, error } = await supabaseAdmin.from('incidents').update(input).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.incident_updated', target: `incident:${data.id}`, metadata: { status: data.status } });
  }
  return data as any;
}

export async function deleteIncident(id: string, adminId?: string) {
  ensureId(id);
  const { data: existing, error: existingError } = await supabaseAdmin.from('incidents').select('*').eq('id', id).maybeSingle();
  fail(existingError);
  if (!existing) throw new AppError('Incident not found.', 404);
  const { error } = await supabaseAdmin.from('incidents').delete().eq('id', id);
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'operations.incident_deleted', target: `incident:${id}`, metadata: { title: existing.title } });
  }
}

export async function getOperationsOverview() {
  const [volunteers, venues, equipment, tasks, incidents] = await Promise.all([listVolunteers(), listVenues(), listEquipment(), listTasks(), listIncidents()]);
  const pct = (items: any[], ready: (x: any) => boolean) => items.length ? Math.round(items.filter(ready).length / items.length * 100) : 0;
  const venue = pct(venues, (x: any) => ['ready', 'confirmed'].includes(String(x.status ?? x.setup_status).toLowerCase()));
  const equipmentPct = pct(equipment, (x: any) => String(x.status).toLowerCase() === 'ready');
  const volunteerPct = pct(volunteers, (x: any) => String(x.status).toLowerCase() === 'active');
  const tasksComplete = pct(tasks, (x: any) => x.status === 'complete');
  return {
    venue,
    equipment: equipmentPct,
    volunteers: volunteerPct,
    checkIn: 0,
    tasksComplete,
    openIncidents: incidents.filter((x: any) => x.status !== 'complete' && x.status !== 'cancelled').length,
    readiness: Math.round((venue + equipmentPct + volunteerPct + tasksComplete) / 4),
  };
}

