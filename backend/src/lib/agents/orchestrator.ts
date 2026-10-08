import { getAdminClient } from '@/lib/supabase/admin';
import { TriageAgent } from './triage-agent';
import { EvidenceAgent } from './evidence-agent';
import { SlaSentinelAgent } from './sla-sentinel-agent';
import { ResolutionVerifierAgent } from './resolution-verifier-agent';
import { evaluateGrievanceSlaAndEscalate } from '@/lib/escalation/engine';
import {
  AgentName,
  AgentExecutionLog,
  TriageInput,
  EvidenceInput,
  SlaSentinelInput,
  ResolutionVerifierInput,
  AgentResult,
  GrievanceEvidence,
} from './types';
import { GrievanceRow } from '@/types/database';

// In-memory fallback ring buffer for agent logs and evidence
const inMemoryLogs: AgentExecutionLog[] = [];
const inMemoryEvidence: GrievanceEvidence[] = [];

export class AgentOrchestrator {
  /**
   * Persists an agent execution trace to database and fallback memory cache
   */
  public static async logExecution(
    grievanceId: string,
    agentName: AgentName,
    actionTaken: string,
    thoughtProcess: string,
    confidence: number,
    metadata: Record<string, any> = {}
  ): Promise<AgentExecutionLog> {
    const logEntry: AgentExecutionLog = {
      id: crypto.randomUUID(),
      grievance_id: grievanceId,
      agent_name: agentName,
      action_taken: actionTaken,
      thought_process: thoughtProcess,
      confidence,
      metadata,
      created_at: new Date().toISOString(),
    };

    // Keep in-memory cache in chronological order
    inMemoryLogs.push(logEntry);
    if (inMemoryLogs.length > 500) inMemoryLogs.shift();

    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return logEntry;
    }

    try {
      const admin = getAdminClient();
      const { error } = await admin.from('agent_execution_logs').insert({
        grievance_id: grievanceId,
        agent_name: agentName,
        action_taken: actionTaken,
        thought_process: thoughtProcess,
        confidence,
        metadata,
      });

      if (error) {
        // Table may not have been created yet or schema cache warming up
        console.warn(`[AgentOrchestrator] Database log note: ${error.message}`);
      }
    } catch (err: any) {
      console.warn(`[AgentOrchestrator] Log persistence fallback active: ${err?.message}`);
    }

    return logEntry;
  }

  /**
   * Retrieves all agent execution logs for a specific grievance
   */
  public static async getLogsForGrievance(grievanceId: string): Promise<AgentExecutionLog[]> {
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return inMemoryLogs.filter((l) => l.grievance_id === grievanceId);
    }

    try {
      const admin = getAdminClient();
      const { data, error } = await admin
        .from('agent_execution_logs')
        .select('*')
        .eq('grievance_id', grievanceId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as AgentExecutionLog[];
      }
    } catch {
      // Fallback below
    }

    // Fallback to in-memory logs filtered by grievanceId
    return inMemoryLogs.filter((l) => l.grievance_id === grievanceId);
  }

  /**
   * Runs the Triage Agent to classify, score priority, calculate SLA, and suggest routing
   */
  public static async runTriage(input: TriageInput): Promise<AgentResult> {
    const result = await TriageAgent.evaluate(input);

    if (input.grievanceId) {
      await this.logExecution(
        input.grievanceId,
        result.agentName,
        result.actionTaken,
        result.thoughtProcess,
        result.confidence,
        result.data
      );
    }

    return result;
  }

  /**
   * Runs the Evidence Agent to verify authenticity, compute SHA-256, and store in Evidence Vault
   */
  public static async runEvidenceVerification(input: EvidenceInput): Promise<AgentResult> {
    const result = await EvidenceAgent.analyze(input);

    if (result.success) {
      const evidenceRecord: GrievanceEvidence = {
        id: crypto.randomUUID(),
        grievance_id: input.grievanceId,
        uploaded_by: input.uploadedBy,
        file_path: input.filePath,
        file_name: input.fileName,
        file_type: input.fileType,
        file_size: input.fileSize,
        sha256_hash: result.data.sha256Hash,
        evidence_type: input.evidenceType || 'PHOTO',
        is_resolution_proof: input.isResolutionProof || false,
        ai_analyzed: true,
        ai_description: result.data.aiDescription,
        relevance_score: result.data.relevanceScore,
        authenticity_status: result.data.authenticityStatus,
        agent_confidence: result.data.confidence,
        verification_notes: result.data.verificationNotes,
        metadata: result.data.metadata,
        created_at: new Date().toISOString(),
      };

      // In-memory cache
      inMemoryEvidence.unshift(evidenceRecord);

      try {
        const admin = getAdminClient();
        await admin.from('grievance_evidence').insert({
          id: evidenceRecord.id,
          grievance_id: evidenceRecord.grievance_id,
          uploaded_by: evidenceRecord.uploaded_by,
          file_path: evidenceRecord.file_path,
          file_name: evidenceRecord.file_name,
          file_type: evidenceRecord.file_type,
          file_size: evidenceRecord.file_size,
          sha256_hash: evidenceRecord.sha256_hash,
          evidence_type: evidenceRecord.evidence_type,
          is_resolution_proof: evidenceRecord.is_resolution_proof,
          ai_analyzed: evidenceRecord.ai_analyzed,
          ai_description: evidenceRecord.ai_description,
          relevance_score: evidenceRecord.relevance_score,
          authenticity_status: evidenceRecord.authenticity_status,
          agent_confidence: evidenceRecord.agent_confidence,
          verification_notes: evidenceRecord.verification_notes,
          metadata: evidenceRecord.metadata,
        });
      } catch (err: any) {
        console.warn(`[AgentOrchestrator] Evidence DB insert fallback active: ${err?.message}`);
      }

      await this.logExecution(
        input.grievanceId,
        result.agentName,
        result.actionTaken,
        result.thoughtProcess,
        result.confidence,
        {
          fileName: input.fileName,
          sha256: result.data.sha256Hash,
          authenticity: result.data.authenticityStatus,
          relevanceScore: result.data.relevanceScore,
        }
      );
    }

    return result;
  }

  /**
   * Retrieves all evidence records for a given grievance
   */
  public static async getEvidenceForGrievance(grievanceId: string): Promise<GrievanceEvidence[]> {
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return inMemoryEvidence.filter((e) => e.grievance_id === grievanceId);
    }

    try {
      const admin = getAdminClient();
      const { data, error } = await admin
        .from('grievance_evidence')
        .select('*')
        .eq('grievance_id', grievanceId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as GrievanceEvidence[];
      }
    } catch {
      // Fallback below
    }

    return inMemoryEvidence.filter((e) => e.grievance_id === grievanceId);
  }

  /**
   * Runs the SLA Sentinel Agent patrol across active tickets or a single target ticket
   */
  public static async runSlaSentinelPatrol(targetGrievanceId?: string): Promise<{
    inspectedCount: number;
    actionsTaken: Array<{ grievanceId: string; ticketNumber: string; action: string; memo: string }>;
  }> {
    const admin = getAdminClient();
    let query = admin.from('grievances').select('*');

    if (targetGrievanceId) {
      query = query.eq('id', targetGrievanceId);
    } else {
      query = query.not('status', 'in', '("CLOSED","REJECTED")');
    }

    const { data: tickets, error } = await query;
    if (error || !tickets || tickets.length === 0) {
      return { inspectedCount: 0, actionsTaken: [] };
    }

    const actionsTaken: Array<{ grievanceId: string; ticketNumber: string; action: string; memo: string }> = [];

    for (const ticket of tickets as GrievanceRow[]) {
      const sentinelInput: SlaSentinelInput = {
        grievanceId: ticket.id,
        ticketNumber: ticket.ticket_number,
        status: ticket.status,
        priority: ticket.priority,
        slaHours: ticket.sla_hours,
        dueAt: ticket.due_at,
        createdAt: ticket.created_at,
        departmentId: ticket.department_id || undefined,
        assignedTo: ticket.assigned_to,
      };

      const result = await SlaSentinelAgent.evaluate(sentinelInput);

      if (result.data.recommendedAction === 'AUTO_ESCALATE') {
        // Trigger real escalation
        await evaluateGrievanceSlaAndEscalate(ticket);
      }

      await this.logExecution(
        ticket.id,
        result.agentName,
        result.actionTaken,
        result.thoughtProcess,
        result.confidence,
        result.data
      );

      actionsTaken.push({
        grievanceId: ticket.id,
        ticketNumber: ticket.ticket_number,
        action: result.data.recommendedAction,
        memo: result.data.sentinelMemo,
      });
    }

    return {
      inspectedCount: tickets.length,
      actionsTaken,
    };
  }

  /**
   * Runs the Resolution Verifier Agent when an officer submits a proposed fix with counter-evidence
   */
  public static async runResolutionVerification(input: ResolutionVerifierInput): Promise<AgentResult> {
    const result = await ResolutionVerifierAgent.verify(input);

    await this.logExecution(
      input.grievanceId,
      result.agentName,
      result.actionTaken,
      result.thoughtProcess,
      result.confidence,
      result.data
    );

    return result;
  }
}
