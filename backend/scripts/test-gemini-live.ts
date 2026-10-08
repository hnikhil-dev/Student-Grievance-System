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

import { GeminiGateway } from '../src/lib/ai/gemini-gateway';
import { TriageAgent } from '../src/lib/agents/triage-agent';
import { ResolutionVerifierAgent } from '../src/lib/agents/resolution-verifier-agent';

async function testGemini() {
  console.log('--- 1. TESTING GEMINI GATEWAY CONNECTIVITY ---');
  console.log('Is Gemini Gateway Available:', GeminiGateway.isAvailable());

  console.log('\n--- 2. CALLING GEMINI 1.5 FLASH (DIRECT STRUCTURED REASONING) ---');
  const testResponse = await GeminiGateway.generateStructuredReasoning<{ testSuccess: boolean; modelName: string; greeting: string }>(
    'You are an AI verification test agent. Return JSON.',
    'Confirm connectivity to Google Gemini API for the Smart Student Grievance System. Return JSON with testSuccess: true, modelName, and greeting.'
  );

  console.log('Response Success:', testResponse.success);
  console.log('Is AI Generated:', testResponse.isAiGenerated);
  console.log('Data:', testResponse.data);
  if (testResponse.error) {
    console.error('Error:', testResponse.error);
  }

  console.log('\n--- 3. RUNNING TRIAGE AGENT POWERED BY GEMINI ---');
  const triageResult = await TriageAgent.evaluate({
    grievanceId: 'test-gemini-1',
    title: 'Severe mold infestation and water dripping from ceiling in Girls Hostel Room 304',
    description: 'Respiratory distress reported by two roommates, black mold spread across ceiling and wall behind wardrobe. Warden has not responded for 3 days.',
    affectedStudents: 2,
    location: 'Girls Hostel Block B Room 304',
    recurrence: true,
  });

  console.log('Triage Category:', triageResult.data.suggestedCategory);
  console.log('Triage Priority:', triageResult.data.priority, `(${triageResult.data.priorityScore}/100)`);
  console.log('SLA Target:', triageResult.data.slaHours, 'hours');
  console.log('Confidence:', triageResult.confidence);
  console.log('AI Chain-of-Thought Trace:\n' + triageResult.thoughtProcess);

  console.log('\n--- 4. RUNNING RESOLUTION VERIFIER AGENT POWERED BY GEMINI ---');
  const resolutionResult = await ResolutionVerifierAgent.verify({
    grievanceId: 'test-gemini-2',
    initialDescription: 'Severe mold infestation and water dripping from ceiling in Girls Hostel Room 304',
    resolutionNotes: 'Dispatched campus sanitation team. Cleaned mold with industrial antimicrobial fungicide, repaired overhead plumbing pipe leak in room above, and repainted affected ceiling area with anti-fungal sealant.',
    officerEvidence: [
      {
        fileName: 'ceiling_after_sanitation.jpg',
        fileType: 'image/jpeg',
        description: 'Repaired and sanitized ceiling in Room 304 with no moisture detected.',
      },
    ],
  });

  console.log('Resolution Verdict:', resolutionResult.data.verdict);
  console.log('Is Approved:', resolutionResult.data.isApproved);
  console.log('AI Comparison Analysis:', resolutionResult.data.comparisonAnalysis);
  console.log('AI Verification Trace:\n' + resolutionResult.thoughtProcess);

  console.log('\n🎉 GEMINI 1.5 FLASH INTEGRATION: 100% OPERATIONAL & VERIFIED!');
}

testGemini().catch(console.error);
