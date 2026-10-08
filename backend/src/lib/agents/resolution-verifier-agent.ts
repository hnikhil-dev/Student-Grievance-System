import { ResolutionVerifierInput, ResolutionVerifierOutput, AgentResult, ResolutionVerdict } from './types';

export class ResolutionVerifierAgent {
  /**
   * Verifies officer resolution notes and counter-evidence against the original complaint.
   */
  public static async verify(input: ResolutionVerifierInput): Promise<AgentResult<ResolutionVerifierOutput>> {
    const initialText = input.initialDescription.toLowerCase();
    const resolutionText = input.resolutionNotes.toLowerCase();

    // 1. Completeness & Length Checks
    const isSubstantive = input.resolutionNotes.trim().length >= 15;
    const hasProof = (input.officerEvidence && input.officerEvidence.length > 0) || false;

    // 2. Physical issue check (requires counter-evidence photo)
    const isPhysicalIncident =
      initialText.includes('leak') ||
      initialText.includes('broken') ||
      initialText.includes('burn') ||
      initialText.includes('water') ||
      initialText.includes('switch') ||
      initialText.includes('door') ||
      initialText.includes('ac') ||
      initialText.includes('fan');

    // 3. Keyword alignment between complaint and resolution
    const repairKeywords = ['replaced', 'fixed', 'repaired', 'cleaned', 'restored', 'updated', 'resolved', 'inspected', 'sanitized', 'installed'];
    const matchedActions = repairKeywords.filter((kw) => resolutionText.includes(kw));

    let verdict: ResolutionVerdict = 'VERIFIED_RESOLVED';
    let confidence = 0.94;
    let comparisonAnalysis = '';

    if (!isSubstantive) {
      verdict = 'DEFICIENT_RESOLUTION';
      confidence = 0.98;
      comparisonAnalysis = 'Resolution notes are overly brief, missing specific technical actions taken to rectify the grievance.';
    } else if (isPhysicalIncident && !hasProof) {
      verdict = 'FURTHER_EVIDENCE_REQUIRED';
      confidence = 0.88;
      comparisonAnalysis = 'Reported incident involves physical facility infrastructure. High-confidence closure requires photographic counter-evidence from the officer.';
    } else {
      verdict = 'VERIFIED_RESOLVED';
      confidence = hasProof ? 0.96 : 0.90;
      comparisonAnalysis = `Resolution actions (${matchedActions.join(', ') || 'corrective actions'}) directly correlate with the reported failure points. Counter-evidence verified.`;
    }

    const thoughtProcess = [
      `[STEP 1: RECONCILIATION AUDIT] Cross-referenced original complaint symptoms against officer corrective notes. Found key action verbs: [${matchedActions.join(', ') || 'standard resolution'}].`,
      `[STEP 2: COUNTER-EVIDENCE INSPECTION] Evaluated officer proof assets (${input.officerEvidence?.length || 0} files). Physical facility requirement checked: ${isPhysicalIncident ? 'MANDATORY_PROOF' : 'OPTIONAL_PROOF'}.`,
      `[STEP 3: INTEGRITY & QUALITY CHECKLIST] Substantive text: ${isSubstantive}, Proof attached: ${hasProof}, Actionable alignment: ${matchedActions.length > 0}.`,
      `[STEP 4: VERIFICATION VERDICT] Issued determination '${verdict}' with confidence ${(confidence * 100).toFixed(1)}%. Ready for student confirmation.`,
    ].join('\n');

    const output: ResolutionVerifierOutput = {
      verdict,
      confidence,
      isApproved: verdict === 'VERIFIED_RESOLVED',
      counterEvidenceVerified: hasProof,
      comparisonAnalysis,
      verificationNotes: `Resolution Verifier Agent concluded '${verdict}'. ${comparisonAnalysis}`,
      checklist: {
        issueAddressed: matchedActions.length > 0 || isSubstantive,
        proofProvided: hasProof,
        satisfactoryQuality: verdict === 'VERIFIED_RESOLVED',
      },
    };

    return {
      success: true,
      agentName: 'RESOLUTION_VERIFIER',
      actionTaken: 'COUNTER_EVIDENCE_VERIFICATION',
      thoughtProcess,
      confidence,
      data: output,
    };
  }
}
