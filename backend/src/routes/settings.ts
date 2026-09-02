import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requirePermission, type AuthenticatedRequest } from '../middleware/auth.js';
import { getSettingsConfiguration } from '../services/settingsService.js';
import { getHeartbeatStatus, isHeartbeatSchedulerRunning, runHeartbeat, updateHeartbeatConfig } from '../services/heartbeatService.js';

const router = Router();
router.use((req, res, next) => { void requireAdmin(req as AuthenticatedRequest, res, next); });

router.get('/', async (_req, res, next) => {
	try { res.json({ config: await getSettingsConfiguration() }); } catch (error) { next(error); }
});

router.get('/heartbeat', requirePermission('system.health.view'), async (_req, res, next) => {
	try { res.json(await getHeartbeatStatus(isHeartbeatSchedulerRunning())); } catch (error) { next(error); }
});

const heartbeatConfigSchema = z.object({
	heartbeat_enabled: z.boolean().optional(),
	heartbeat_min_checks_per_week: z.number().int().min(1).max(7).optional(),
	heartbeat_max_checks_per_week: z.number().int().min(1).max(7).optional(),
	heartbeat_retry_enabled: z.boolean().optional(),
	heartbeat_retry_delay_hours: z.number().int().min(1).max(168).optional(),
	heartbeat_retry_max_attempts: z.number().int().min(0).max(10).optional(),
	heartbeat_retry_jitter_minutes: z.number().int().min(0).max(1440).optional(),
	heartbeat_run_on_startup: z.boolean().optional(),
});

router.patch('/heartbeat', requirePermission('system.health.manage'), async (req, res, next) => {
	try { res.json(await updateHeartbeatConfig(heartbeatConfigSchema.parse(req.body))); } catch (error) { next(error); }
});

router.post('/heartbeat/run', requirePermission('system.health.manage'), async (_req, res, next) => {
	try { res.json(await runHeartbeat()); } catch (error) { next(error); }
});

export default router;
