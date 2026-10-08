import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
  return env;
}

async function check() {
  const env = loadEnv();
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: d1, error: e1 } = await client.from('grievance_evidence').select('id').limit(1);
  console.log('grievance_evidence:', e1 ? `ERROR: ${e1.message}` : `EXISTS (${d1?.length ?? 0} rows found)`);

  const { data: d2, error: e2 } = await client.from('agent_execution_logs').select('id').limit(1);
  console.log('agent_execution_logs:', e2 ? `ERROR: ${e2.message}` : `EXISTS (${d2?.length ?? 0} rows found)`);
}

check().catch(console.error);
