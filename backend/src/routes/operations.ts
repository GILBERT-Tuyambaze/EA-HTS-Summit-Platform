import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, type AuthenticatedRequest } from '../middleware/auth.js';
import * as s from '../services/operationsService.js';
import { logAuditEvent } from '../services/auditService.js';

const router = Router();
router.use((q, r, n) => void requireAdmin(q as AuthenticatedRequest, r, n));

const log = async (q: AuthenticatedRequest, action: string, target: string) => logAuditEvent({ adminId: q.admin?.email, action, target });

const volunteer = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  shift: z.string().min(1),
  contact: z.string().min(1),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  status: z.string().optional(),
});

const venue = z.object({
  name: z.string().min(1),
  location: z.string().nullable().optional(),
  capacity: z.number().int().nonnegative(),
  status: z.string().optional(),
  notes: z.string().nullable().optional(),
});

const equipment = z.object({
  name: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  status: z.string().optional(),
  assigned_to: z.string().nullable().optional(),
});

const task = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assigned_to: z.string().nullable().optional(),
  status: z.enum(['pending', 'in_progress', 'complete', 'cancelled']).optional(),
  due_date: z.string().date().nullable().optional(),
});

const incident = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'in_progress', 'complete', 'cancelled']).optional(),
  assigned_to: z.string().nullable().optional(),
});

router.get('/readiness', async (_q, r, n) => { try { r.json(await s.getOperationsOverview()); } catch (e) { n(e); } });
router.get('/volunteers', async (_q, r, n) => { try { r.json({ volunteers: await s.listVolunteers() }); } catch (e) { n(e); } });
router.post('/volunteers', async (q: AuthenticatedRequest, r, n) => { try { const x = await s.createVolunteer(volunteer.parse(q.body), q.admin?.email); await log(q, 'operations.volunteer_created', `volunteer:${x.id}`); r.status(201).json(x); } catch (e) { n(e); } });
router.patch('/volunteers/:id', async (q: AuthenticatedRequest, r, n) => { try { const x = await s.updateVolunteer(String(q.params.id), volunteer.partial().parse(q.body), q.admin?.email); await log(q, 'operations.volunteer_updated', `volunteer:${x.id}`); r.json(x); } catch (e) { n(e); } });
router.delete('/volunteers/:id', async (q: AuthenticatedRequest, r, n) => { try { await s.deleteVolunteer(String(q.params.id), q.admin?.email); await log(q, 'operations.volunteer_deleted', `volunteer:${String(q.params.id)}`); r.status(204).send(); } catch (e) { n(e); } });

for (const [name, schema, create, update, del] of [
  ['venues', venue, s.createVenue, s.updateVenue, s.deleteVenue],
  ['equipment', equipment, s.createEquipment, s.updateEquipment, s.deleteEquipment],
  ['tasks', task, s.createTask, s.updateTask, s.deleteTask],
  ['incidents', incident, s.createIncident, s.updateIncident, s.deleteIncident],
] as const) {
  router.get(`/${name}`, async (_q, r, n) => { try { const fn = { venues: s.listVenues, equipment: s.listEquipment, tasks: s.listTasks, incidents: s.listIncidents }[name]; r.json({ [name]: await fn() }); } catch (e) { n(e); } });
  router.post(`/${name}`, async (q: AuthenticatedRequest, r, n) => { try { const x = await create(schema.parse(q.body) as never, q.admin?.email); await log(q, `operations.${name}_created`, `${name.slice(0, -1)}:${(x as any).id}`); r.status(201).json(x); } catch (e) { n(e); } });
  router.patch(`/${name}/:id`, async (q: AuthenticatedRequest, r, n) => { try { const x = await update(String(q.params.id), schema.partial().parse(q.body), q.admin?.email); await log(q, `operations.${name}_updated`, `${name.slice(0, -1)}:${(x as any).id}`); r.json(x); } catch (e) { n(e); } });
  router.delete(`/${name}/:id`, async (q: AuthenticatedRequest, r, n) => { try { await del(String(q.params.id), q.admin?.email); await log(q, `operations.${name}_deleted`, `${name.slice(0, -1)}:${String(q.params.id)}`); r.status(204).send(); } catch (e) { n(e); } });
}

router.get('/', async (_q, r, n) => { try { const [overview, volunteers, venues] = await Promise.all([s.getOperationsOverview(), s.listVolunteers(), s.listVenues()]); r.json({ overview, volunteers, venues }); } catch (e) { n(e); } });

export default router;
