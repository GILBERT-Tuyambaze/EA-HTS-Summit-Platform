import { createClient } from '@supabase/supabase-js';
import env from './env.js';
import WebSocket from 'ws';

const commonOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: WebSocket as any,
  },
};

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, commonOptions);

export const supabasePublic = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, commonOptions);
