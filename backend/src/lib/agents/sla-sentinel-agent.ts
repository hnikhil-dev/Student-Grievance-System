import { calculateSlaStatus } from '@/lib/sla/engine';
import { SlaSentinelInput, SlaSentinelOutput, AgentResult } from './types';

export class SlaSentinelAgent {
  /**
   * Evaluates SLA health for a grievance and determines automated governance actions.
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
      memo = `Grievance ${input.ticketNumber} is in stage '${input.status}'. SLA clock effectively stopped or under verification.`;
    } else if (metrics.isOverdue) {
      recommendedAction = 'AUTO_ESCALATE';
      memo = `CRITICAL ALERT: Grievance ${input.ticketNumber} exceeded SLA target by ${Math.abs(remainingHours)}h. Immediate escalation required.`;
    } else if (metrics.isWarning) {
      recommendedAction = 'WARN_OFFICER';
      memo = `WARNING: Grievance ${input.ticketNumber} has consumed ${metrics.elapsedPercent}% of SLA window. Officer nudge dispatched.`;
    } else {
      recommendedAction = 'NO_ACTION';
      memo = `NORMAL: Grievance ${input.ticketNumber} is within SLA bounds (${remainingHours}h remaining, ${metrics.elapsedPercent}% elapsed).`;
    }

    const thoughtProcess = [
      `[STEP 1: TIME SYNCHRONIZATION] Target SLA due at ${input.dueAt}. Current server clock comparison calculated elapsed=${elapsedHours}h, remaining=${remainingHours}h.`,
      `[STEP 2: VELOCITY AUDIT] SLA consumption velocity is at ${metrics.elapsedPercent}%. Status is currently '${input.status}' with priority '${input.priority}'.`,
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
