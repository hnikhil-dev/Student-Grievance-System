import { describe, it, expect } from 'vitest';
import { TriageAgent } from '@/lib/agents/triage-agent';
import { SlaSentinelAgent } from '@/lib/agents/sla-sentinel-agent';
import { ResolutionVerifierAgent } from '@/lib/agents/resolution-verifier-agent';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

describe('Autonomous Multi-Agent Governance Pipeline', () => {
  describe('TriageAgent', () => {
    it('accurately classifies IT infrastructure failure, scores priority, and sets SLA', async () => {
      const result = await TriageAgent.evaluate({
        grievanceId: 'grv-triage-1',
        title: 'Core WiFi router in Library Reading Room offline',
        description: 'No student can connect to internet or research portals ahead of midterm exams',
        affectedStudents: 80,
      });

      expect(result.success).toBe(true);
      expect(result.agentName).toBe('TRIAGE_AGENT');
      expect(result.data.suggestedCategory).toBe('IT');
      expect(['HIGH', 'CRITICAL']).toContain(result.data.priority);
      expect(result.data.slaHours).toBeLessThanOrEqual(12);
      expect(result.thoughtProcess).toContain('[STEP 1: INTENT DECOMPOSITION]');
      expect(result.thoughtProcess).toContain('[STEP 3: MULTI-FACTOR WEIGHTING]');
      expect(result.thoughtProcess).toContain('[STEP 4: SMART ROUTING & SLA COMMITMENT]');
    });

    it('classifies hostel facility grievance and assigns appropriate department', async () => {
      const result = await TriageAgent.evaluate({
        grievanceId: 'grv-triage-2',
        title: 'Water cooler stopped working in Hostel Block C',
        description: 'Room 201 to 215 have no drinking water supply',
        affectedStudents: 30,
      });

      expect(result.data.suggestedCategory).toBe('HOSTEL');
    });
  });

  describe('SlaSentinelAgent', () => {
    it('reports NO_ACTION when grievance is well within SLA window', async () => {
      const now = Date.now();
      const createdAt = new Date(now - 1 * 60 * 60 * 1000).toISOString(); // 1h ago
      const dueAt = new Date(now + 23 * 60 * 60 * 1000).toISOString(); // 23h in future

      const result = await SlaSentinelAgent.evaluate({
        grievanceId: 'grv-sla-1',
        ticketNumber: 'GRV-2026-0001',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        slaHours: 24,
        createdAt,
        dueAt,
      });

      expect(result.data.isOverdue).toBe(false);
      expect(result.data.recommendedAction).toBe('NO_ACTION');
      expect(result.data.sentinelMemo).toContain('NORMAL');
    });

    it('triggers WARN_OFFICER when SLA consumption exceeds warning threshold (>75%)', async () => {
      const now = Date.now();
      const createdAt = new Date(now - 20 * 60 * 60 * 1000).toISOString(); // 20h elapsed
      const dueAt = new Date(now + 4 * 60 * 60 * 1000).toISOString(); // 4h remaining of 24h (83% consumed)

      const result = await SlaSentinelAgent.evaluate({
        grievanceId: 'grv-sla-2',
        ticketNumber: 'GRV-2026-0002',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        slaHours: 24,
        createdAt,
        dueAt,
      });

      expect(result.data.isWarning).toBe(true);
      expect(result.data.recommendedAction).toBe('WARN_OFFICER');
      expect(result.data.sentinelMemo).toContain('WARNING');
    });

    it('triggers AUTO_ESCALATE when grievance breaches deadline', async () => {
      const now = Date.now();
      const createdAt = new Date(now - 10 * 60 * 60 * 1000).toISOString(); // 10h ago
      const dueAt = new Date(now - 2 * 60 * 60 * 1000).toISOString(); // 2h overdue

      const result = await SlaSentinelAgent.evaluate({
        grievanceId: 'grv-sla-3',
        ticketNumber: 'GRV-2026-0003',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        slaHours: 4,
        createdAt,
        dueAt,
      });

      expect(result.data.isOverdue).toBe(true);
      expect(result.data.recommendedAction).toBe('AUTO_ESCALATE');
      expect(result.actionTaken).toBe('AUTO_ESCALATION_TRIGGER');
    });
  });

  describe('ResolutionVerifierAgent', () => {
    it('flags one-word or empty resolution notes as DEFICIENT_RESOLUTION', async () => {
      const result = await ResolutionVerifierAgent.verify({
        grievanceId: 'grv-res-1',
        initialDescription: 'Ceiling projector lamp broken in Auditorium Hall 1',
        resolutionNotes: 'fixed it',
      });

      expect(result.data.verdict).toBe('DEFICIENT_RESOLUTION');
      expect(result.data.isApproved).toBe(false);
      expect(result.data.comparisonAnalysis).toContain('brief');
    });

    it('demands photo counter-evidence for physical infrastructure complaints', async () => {
      const result = await ResolutionVerifierAgent.verify({
        grievanceId: 'grv-res-2',
        initialDescription: 'Severe water leak under sink in Ground Floor washroom',
        resolutionNotes: 'Replaced the silicone gasket and copper pipe joint completely.',
        officerEvidence: [], // No proof attached
      });

      expect(result.data.verdict).toBe('FURTHER_EVIDENCE_REQUIRED');
      expect(result.data.isApproved).toBe(false);
      expect(result.data.counterEvidenceVerified).toBe(false);
    });

    it('approves complete resolution notes with verified counter-evidence proof', async () => {
      const result = await ResolutionVerifierAgent.verify({
        grievanceId: 'grv-res-3',
        initialDescription: 'Broken electrical switchboard sparking in Lab 2',
        resolutionNotes: 'Replaced electrical switchboard unit, tested circuit with multimeter at 230V stable.',
        officerEvidence: [
          {
            fileName: 'switchboard_replacement_proof.jpg',
            fileType: 'image/jpeg',
            description: 'New modular switchboard safely mounted and certified',
          },
        ],
      });

      expect(result.data.verdict).toBe('VERIFIED_RESOLVED');
      expect(result.data.isApproved).toBe(true);
      expect(result.data.counterEvidenceVerified).toBe(true);
      expect(result.thoughtProcess).toContain('[STEP 4: VERIFICATION VERDICT]');
    });
  });

  describe('AgentOrchestrator', () => {
    it('records and retrieves agent reasoning traces in sequential order', async () => {
      const testId = 'orchestrator-test-' + Date.now();

      await AgentOrchestrator.logExecution(
        testId,
        'TRIAGE_AGENT',
        'CLASSIFY_AND_SCORE',
        'Step 1: Analyzed intent. Step 2: Routed to IT.',
        0.95,
        { category: 'IT' }
      );

      await AgentOrchestrator.logExecution(
        testId,
        'SLA_SENTINEL',
        'PATROL_AND_EVALUATE',
        'Step 1: Clock checked. Ticket active.',
        0.98,
        { remainingHours: 12 }
      );

      const logs = await AgentOrchestrator.getLogsForGrievance(testId);
      expect(logs.length).toBe(2);
      expect(logs[0].agent_name).toBe('TRIAGE_AGENT');
      expect(logs[1].agent_name).toBe('SLA_SENTINEL');
    });
  });
});
