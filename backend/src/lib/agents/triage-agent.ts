import { calculatePriority } from '@/lib/priority/engine';
import { getSlaHoursForPriority } from '@/lib/sla/engine';
import { Priority, Severity, Urgency, TriageInput, TriageOutput, AgentResult } from './types';

// Category keyword dictionary for deterministic NLP classification
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  IT: ['wifi', 'internet', 'server', 'portal', 'laptop', 'computer', 'network', 'login', 'lab', 'switch', 'router', 'ethernet', 'system down', 'erp'],
  HOSTEL: ['hostel', 'room', 'warden', 'mess', 'bed', 'cooler', 'geyser', 'water cooler', 'washroom', 'roommate', 'curfew', 'block'],
  MAINTENANCE: ['plumbing', 'tap', 'leak', 'ac', 'air conditioner', 'light', 'fan', 'bulb', 'electricity', 'elevator', 'lift', 'window', 'door', 'switchboard', 'generator'],
  ACADEMICS: ['exam', 'marks', 'grading', 'attendance', 'faculty', 'professor', 'course', 'credit', 'syllabus', 'timetable', 'lecture', 're-evaluation'],
  TRANSPORT: ['bus', 'route', 'driver', 'shuttle', 'transport', 'commute', 'pickup', 'delay', 'van'],
  LIBRARY: ['book', 'library', 'journal', 'fine', 'librarian', 'reading room', 'borrow', 'return', 'catalog'],
  CANTEEN: ['food', 'canteen', 'hygiene', 'quality', 'taste', 'price', 'lunch', 'dinner', 'snack', 'cafeteria', 'meal'],
  STUDENT_AFFAIRS: ['ragging', 'harassment', 'club', 'event', 'scholarship', 'certificate', 'id card', 'counseling', 'sports'],
  ADMINISTRATION: ['fee', 'receipt', 'account', 'office', 'registrar', 'admission', 'document', 'counter'],
};

export class TriageAgent {
  /**
   * Evaluates a grievance, performs intent classification, impact scoring, and routing.
   */
  public static async evaluate(input: TriageInput): Promise<AgentResult<TriageOutput>> {
    const textCorpus = `${input.title} ${input.description}`.toLowerCase();

    // 1. Determine Category
    let detectedCategory = input.category ? input.category.toUpperCase() : '';
    let highestMatches = 0;

    if (!detectedCategory || detectedCategory === 'OTHER') {
      for (const [dept, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const matches = keywords.filter((kw) => textCorpus.includes(kw)).length;
        if (matches > highestMatches) {
          highestMatches = matches;
          detectedCategory = dept;
        }
      }
    }

    if (!detectedCategory) {
      detectedCategory = 'ADMINISTRATION';
    }

    // 2. Derive Severity and Urgency if not provided
    const severity: Severity = input.severity || this.deriveSeverity(textCorpus, input.affectedStudents || 1);
    const urgency: Urgency = input.urgency || this.deriveUrgency(textCorpus);
    const affected = input.affectedStudents || (textCorpus.includes('all') || textCorpus.includes('entire') ? 50 : 1);
    const recurrence = input.recurrence ?? (textCorpus.includes('again') || textCorpus.includes('repeatedly') || textCorpus.includes('third time'));

    // 3. Compute Deterministic Priority Score
    const priorityResult = calculatePriority({
      severity,
      urgency,
      affected_students: affected,
      recurrence,
      category: detectedCategory,
    });

    // 4. Calculate SLA Target
    const slaHours = getSlaHoursForPriority(priorityResult.priority);

    // 5. Generate CoT (Chain-of-Thought) Reasoning Trace
    const thoughtProcess = [
      `[STEP 1: INTENT DECOMPOSITION] Analyzed grievance corpus ("${input.title}"). Key entities identified match category '${detectedCategory}'.`,
      `[STEP 2: IMPACT & SEVERITY ASSESSMENT] Evaluated student impact cohort (${affected} affected, recurrence=${recurrence}). Severity categorized as '${severity}', Urgency as '${urgency}'.`,
      `[STEP 3: MULTI-FACTOR WEIGHTING] Deterministic Priority Engine derived score ${priorityResult.score}/100 [Priority: ${priorityResult.priority}]. Factors: ${priorityResult.reasons.join('; ')}.`,
      `[STEP 4: SMART ROUTING & SLA COMMITMENT] Dispatched to Department '${detectedCategory}'. Bound SLA deadline of ${slaHours} hours.`,
    ].join('\n');

    const output: TriageOutput = {
      suggestedCategory: detectedCategory,
      suggestedDepartmentCode: detectedCategory,
      priority: priorityResult.priority,
      priorityScore: priorityResult.score,
      priorityReasons: priorityResult.reasons,
      slaHours: slaHours,
      summary: `${detectedCategory} incident: ${input.title}. Evaluated at ${priorityResult.priority} priority (${priorityResult.score}/100).`,
      urgencyLevel: urgency,
    };

    return {
      success: true,
      agentName: 'TRIAGE_AGENT',
      actionTaken: 'CLASSIFY_AND_SCORE',
      thoughtProcess,
      confidence: Math.min(0.85 + (highestMatches * 0.03), 0.99),
      data: output,
    };
  }

  private static deriveSeverity(text: string, affected: number): Severity {
    if (
      text.includes('burn') ||
      text.includes('fire') ||
      text.includes('electric') ||
      text.includes('contamination') ||
      text.includes('danger') ||
      text.includes('hospital') ||
      text.includes('injury') ||
      affected >= 50
    ) {
      return 'CRITICAL';
    }
    if (text.includes('exam') || text.includes('deadline') || text.includes('fail') || affected >= 15) {
      return 'HIGH';
    }
    if (text.includes('leak') || text.includes('slow') || text.includes('broken')) {
      return 'MODERATE';
    }
    return 'LOW';
  }

  private static deriveUrgency(text: string): Urgency {
    if (text.includes('immediate') || text.includes('emergency') || text.includes('urgent') || text.includes('today')) {
      return 'IMMEDIATE';
    }
    if (text.includes('tomorrow') || text.includes('exam') || text.includes('soon')) {
      return 'HIGH';
    }
    if (text.includes('weekend') || text.includes('next week')) {
      return 'LOW';
    }
    return 'MEDIUM';
  }
}
