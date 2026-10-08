import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
}

loadEnv();

async function main() {
  const key = process.env.GEMINI_API_KEY;
  console.log('Testing key prefix:', key?.substring(0, 10));

  // Check v1 models endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) {
    console.error('ListModels Error:', data.error);
    return;
  }
  const generateModels = data.models
    ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
    ?.map((m: any) => m.name);
  console.log('Supported generateContent models:', generateModels);
}

main().catch(console.error);
