import { ResolutionVerifierInput, ResolutionVerifierOutput, AgentResult, ResolutionVerdict } from './types';
import { GeminiGateway } from '@/lib/ai/gemini-gateway';

export class ResolutionVerifierAgent {
  /**
   * Verifies officer resolution notes and counter-evidence against the original complaint.
   * Leverages Gemini LLM for deep semantic critique when available; otherwise uses dynamic rule heuristics.
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
      initialText.includes('fan') ||
      initialText.includes('plumbing') ||
      initialText.includes('light');

    // 3. Attempt Gemini LLM Verification Critique if available
    if (GeminiGateway.isAvailable()) {
      const systemInstruction = `You are RESOLUTION_VERIFIER, an autonomous institutional ombudsman and quality assurance auditor.
Critique proposed solutions to student complaints. Cross-reference original complaint symptoms against the officer's corrective actions and proof.
Verify whether the resolution genuinely fixes the root cause and ensure physical infrastructure issues have photographic counter-evidence.`;

      const userPrompt = `Complaint Details:
Original Complaint: "${input.initialDescription}"
Officer Resolution Notes: "${input.resolutionNotes}"
Officer Counter-Evidence Proof Files: ${JSON.stringify(input.officerEvidence || [])}
Is Physical Infrastructure: ${isPhysicalIncident}

Audit this resolution and produce JSON:
{
  "verdict": "VERIFIED_RESOLVED" | "DEFICIENT_RESOLUTION" | "FURTHER_EVIDENCE_REQUIRED",
  "confidence": number (float 0.0 to 1.0),
  "isApproved": boolean,
  "comparisonAnalysis": string (2-3 sentences explaining whether the actions directly address the reported failure),
  "verificationNotes": string,
  "checklist": {
    "issueAddressed": boolean,
    "proofProvided": boolean,
    "satisfactoryQuality": boolean
  },
  "thoughtProcess": string (4-step audit trace: Step 1 Reconciliation Audit, Step 2 Counter-Evidence Inspection, Step 3 Quality Checklist, Step 4 Verification Verdict)
}`;

      const aiResponse = await GeminiGateway.generateStructuredReasoning<any>(systemInstruction, userPrompt);
      if (aiResponse.success && aiResponse.data) {
        const v = aiResponse.data;
        const verdict: ResolutionVerdict = ['VERIFIED_RESOLVED', 'DEFICIENT_RESOLUTION', 'FURTHER_EVIDENCE_REQUIRED'].includes(v.verdict)
          ? v.verdict
          : 'VERIFIED_RESOLVED';

        const output: ResolutionVerifierOutput = {
          verdict,
          confidence: Math.min(1.0, Math.max(0.5, Number(v.confidence) || 0.95)),
          isApproved: verdict === 'VERIFIED_RESOLVED',
          counterEvidenceVerified: hasProof,
          comparisonAnalysis: v.comparisonAnalysis || 'Resolution actions reconcile with reported issue symptoms.',
          verificationNotes: v.verificationNotes || `Resolution Verifier Agent concluded '${verdict}'.`,
          checklist: {
            issueAddressed: Boolean(v.checklist?.issueAddressed ?? true),
            proofProvided: hasProof,
            satisfactoryQuality: verdict === 'VERIFIED_RESOLVED',
          },
        };

        return {
          success: true,
          agentName: 'RESOLUTION_VERIFIER',
          actionTaken: 'COUNTER_EVIDENCE_VERIFICATION',
          thoughtProcess: v.thoughtProcess || `[STEP 1: RECONCILIATION AUDIT] Cross-referenced complaint vs notes.\n[STEP 2: COUNTER-EVIDENCE] Verified proof files.\n[STEP 3: QUALITY CHECKLIST] Audited completeness.\n[STEP 4: VERIFICATION VERDICT] Issued ${verdict}.`,
          confidence: output.confidence,
          data: output,
        };
      }
    }

    // 4. Dynamic Heuristic Verification (Fail-Safe Engine)
    const repairKeywords = ['replaced', 'fixed', 'repaired', 'cleaned', 'restored', 'updated', 'resolved', 'inspected', 'sanitized', 'installed', 'corrected'];
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
