import { calculateSlaStatus } from '@/lib/sla/engine';
import { SlaSentinelInput, SlaSentinelOutput, AgentResult } from './types';
import { GeminiGateway } from '@/lib/ai/gemini-gateway';

export class SlaSentinelAgent {
  /**
   * Evaluates SLA health for a grievance and determines automated governance actions.
   * Leverages Gemini LLM for executive memo generation when configured; otherwise uses dynamic velocity metrics.
   */
  public static async evaluate(input: SlaSentinelInput): Promise<AgentResult<SlaSentinelOutput>> {
    const metrics = calculateSlaStatus(input.createdAt, input.dueAt);
    const remainingHours = Number((metrics.remainingMinutes / 60).toFixed(1));
    const elapsedHours = Number(((input.slaHours * 60 - metrics.remainingMinutes) / 60).toFixed(1));

    let recommendedAction: 'NO_ACTION' | 'WARN_OFFICER' | 'AUTO_ESCALATE' = 'NO_ACTION';
    let memo = '';

    const terminalStatuses = ['CLOSED', 'REJECTED', 'STUDENT_VERIFICATION', 'RESOLUTION_PROPOSED'];
    const isTerminal = terminalStatuses.includes(input.status);

    if (isTerminal) {
      recommendedAction = 'NO_ACTION';
      memo = `Grievance ${input.ticketNumber} is in terminal or verification stage '${input.status}'. SLA clock effectively stopped.`;
    } else if (metrics.isOverdue) {
      recommendedAction = 'AUTO_ESCALATE';
      memo = `CRITICAL ALERT: Grievance ${input.ticketNumber} exceeded SLA target by ${Math.abs(remainingHours)}h. Immediate escalation required.`;
    } else if (metrics.isWarning) {
      recommendedAction = 'WARN_OFFICER';
      memo = `WARNING: Grievance ${input.ticketNumber} has consumed ${metrics.elapsedPercent}% of SLA window (${remainingHours}h remaining). Officer nudge dispatched.`;
    } else {
      recommendedAction = 'NO_ACTION';
      memo = `NORMAL: Grievance ${input.ticketNumber} is healthy within SLA bounds (${remainingHours}h remaining, ${metrics.elapsedPercent}% elapsed).`;
    }

    // 1. Attempt Gemini Executive Governance Memo if available
    if (GeminiGateway.isAvailable() && !isTerminal) {
      const systemInstruction = `You are SLA_SENTINEL, an autonomous institutional governance agent overseeing student grievance compliance.
Formulate an executive administrative compliance memo evaluating risk of breach, operational velocity, and remediation orders.`;

      const userPrompt = `Ticket: ${input.ticketNumber}
Priority: ${input.priority}
Status: ${input.status}
SLA Allocated: ${input.slaHours} hours
Elapsed Time: ${elapsedHours} hours (${metrics.elapsedPercent}% consumed)
Remaining Time: ${remainingHours} hours
Overdue: ${metrics.isOverdue}
Warning Threshold Exceeded: ${metrics.isWarning}

Produce JSON:
{
  "sentinelMemo": string (professional 2-sentence administrative notice),
  "thoughtProcess": string (4-step reasoning trace: Step 1 Clock Sync, Step 2 Velocity Audit, Step 3 Breach Probability, Step 4 Governance Intervention)
}`;

      const aiResponse = await GeminiGateway.generateStructuredReasoning<any>(systemInstruction, userPrompt);
      if (aiResponse.success && aiResponse.data) {
        if (aiResponse.data.sentinelMemo) memo = aiResponse.data.sentinelMemo;
        const output: SlaSentinelOutput = {
          elapsedHours,
          remainingHours,
          percentageConsumed: metrics.elapsedPercent,
          isOverdue: metrics.isOverdue,
          isWarning: metrics.isWarning,
          recommendedAction,
          sentinelMemo: memo,
          escalatedNow: recommendedAction === 'AUTO_ESCALATE' && input.status !== 'ESCALATED',
        };

        return {
          success: true,
          agentName: 'SLA_SENTINEL',
          actionTaken: recommendedAction === 'AUTO_ESCALATE' ? 'AUTO_ESCALATION_TRIGGER' : 'PATROL_AND_EVALUATE',
          thoughtProcess: aiResponse.data.thoughtProcess || `[STEP 1: TIME SYNCHRONIZATION] Due at ${input.dueAt}.\n[STEP 2: VELOCITY AUDIT] Velocity ${metrics.elapsedPercent}%.\n[STEP 3: RISK DETECTION] Overdue=${metrics.isOverdue}.\n[STEP 4: GOVERNANCE DECISION] ${recommendedAction}.`,
          confidence: 0.99,
          data: output,
        };
      }
    }

    // 2. Dynamic Heuristic Governance Trace
    const thoughtProcess = [
      `[STEP 1: TIME SYNCHRONIZATION] Target SLA due at ${input.dueAt}. Server clock audit calculated elapsed=${elapsedHours}h, remaining=${remainingHours}h.`,
      `[STEP 2: VELOCITY AUDIT] SLA consumption velocity is at ${metrics.elapsedPercent}%. Ticket is currently '${input.status}' with priority '${input.priority}'.`,
      `[STEP 3: RISK DETECTION] Overdue=${metrics.isOverdue}, Warning=${metrics.isWarning}. Terminal state=${isTerminal}.`,
      `[STEP 4: GOVERNANCE DECISION] Action selected: '${recommendedAction}'. ${memo}`,
    ].join('\n');

    const output: SlaSentinelOutput = {
      elapsedHours,
      remainingHours,
      percentageConsumed: metrics.elapsedPercent,
      isOverdue: metrics.isOverdue,
      isWarning: metrics.isWarning,
      recommendedAction,
      sentinelMemo: memo,
      escalatedNow: recommendedAction === 'AUTO_ESCALATE' && input.status !== 'ESCALATED',
    };

    return {
      success: true,
      agentName: 'SLA_SENTINEL',
      actionTaken: recommendedAction === 'AUTO_ESCALATE' ? 'AUTO_ESCALATION_TRIGGER' : 'PATROL_AND_EVALUATE',
      thoughtProcess,
      confidence: 0.99,
      data: output,
    };
  }
}
