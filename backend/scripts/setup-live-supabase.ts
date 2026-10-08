import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error('No .env file found at:', envPath);
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const url = rawUrl.replace(/\/+$/, '');
  console.log(`Connecting to Supabase at: ${url}`);

  const client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Create or Verify Storage Bucket: grievance-files
  console.log('\n--- 1. CONFIGURING STORAGE BUCKET ---');
  const { data: buckets, error: listError } = await client.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError.message);
  } else {
    console.log('Existing buckets:', buckets.map((b) => b.name));
    const exists = buckets.some((b) => b.name === 'grievance-files');
    if (!exists) {
      console.log('Creating "grievance-files" storage bucket...');
      const { data: newBucket, error: createError } = await client.storage.createBucket('grievance-files', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'],
      });
      if (createError) {
        console.error('Failed to create bucket:', createError.message);
      } else {
        console.log('✅ "grievance-files" bucket successfully created (public: true, 10MB limit)!');
      }
    } else {
      console.log('✅ "grievance-files" bucket already exists!');
    }
  }

  // 2. Test Tables & Check if Migrations have been applied
  console.log('\n--- 2. CHECKING DATABASE TABLES ---');
  const tables = ['departments', 'profiles', 'grievances', 'notifications', 'grievance_comments', 'sla_rules'];
  const tableStatus: Record<string, boolean> = {};

  for (const t of tables) {
    const { data, error } = await client.from(t).select('id').limit(1);
    if (error) {
      tableStatus[t] = false;
      console.log(`❌ Table '${t}' does not exist or returned error: ${error.message}`);
    } else {
      tableStatus[t] = true;
      console.log(`✅ Table '${t}' is present and queryable!`);
    }
  }

  // 3. Realtime instructions & check
  console.log('\n--- 3. SUPABASE REALTIME CONFIGURATION ---');
  console.log('To activate Realtime broadcasts across websockets for grievances and notifications,');
  console.log('the database publication "supabase_realtime" must include the target tables.');
  console.log('\nExecuting/printing migration SQL for realtime...');
}

main().catch(console.error);
