import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const envCandidates = [
  resolve(backendRoot, '.env'),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

type Env = {
  PORT: number;
  FRONTEND_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
};

const env = {
  PORT: Number(process.env.PORT ?? 4000),
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? '',
  BREVO_API_KEY: process.env.BREVO_API_KEY ?? '',
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL ?? 'noreply@example.com',
} satisfies Env;

const missingKeys = Object.entries(env)
  .filter(([key, value]) => key !== 'PORT' && (value === '' || value === null || value === undefined))
  .map(([key]) => key);

if (missingKeys.length > 0) {
  throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
}

export default env;
