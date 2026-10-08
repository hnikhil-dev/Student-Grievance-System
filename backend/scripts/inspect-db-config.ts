import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
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

async function main() {
  const env = loadEnv();
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: depts, error: dErr } = await client.from('departments').select('id, code, name, description');
  console.log('--- DEPARTMENTS ---');
  if (dErr) console.error(dErr.message);
  else console.log(`Found ${depts?.length} departments:`, depts?.map((d) => `${d.code}: ${d.name}`));

  const { data: rules, error: rErr } = await client.from('sla_rules').select('*');
  console.log('--- SLA RULES ---');
  if (rErr) console.error(rErr.message);
  else console.log(`Found ${rules?.length} SLA rules:`, rules);
}

main().catch(console.error);
