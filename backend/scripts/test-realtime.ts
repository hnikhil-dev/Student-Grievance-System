import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
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

async function testRealtime() {
  const env = loadEnv();
  const url = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Testing Realtime connection to:', url);
  const client = createClient(url, anonKey);

  const channel = client
    .channel('test-realtime-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'grievances' },
      (payload) => {
        console.log('Received Realtime change event:', payload);
      }
    )
    .subscribe((status, err) => {
      console.log('Realtime Subscription Status:', status, err || '');
      if (status === 'SUBSCRIBED') {
        console.log('🎉 Supabase Realtime channel is active and connected!');
        process.exit(0);
      } else if (status === 'CHANNEL_ERROR') {
        console.log('Channel error details:', err);
        process.exit(1);
      }
    });

  // Timeout after 10 seconds if no response
  setTimeout(() => {
    console.log('Subscription timed out.');
    process.exit(0);
  }, 10000);
}

testRealtime();
