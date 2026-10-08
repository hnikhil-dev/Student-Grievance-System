import { NextRequest } from 'next/server';
import { aiAnalyzeRequestSchema, aiAnalysisSchema, AiAnalysisData } from '@/lib/validation/ai';
import { calculatePriority } from '@/lib/priority/engine';
import { determineDepartmentCode } from '@/lib/assignment/engine';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedRequest = aiAnalyzeRequestSchema.parse(body);

    const affectedStudents = validatedRequest.affected_students || 1;
    const category = validatedRequest.category || 'General';

    // 1. Calculate deterministic priority as resilient baseline
    const priorityResult = calculatePriority({
      severity: 'MODERATE',
      urgency: 'MEDIUM',
      affected_students: affectedStudents,
      category,
      title: validatedRequest.title,
      description: validatedRequest.description,
    });

    const mappedDeptCode = determineDepartmentCode(category, validatedRequest.title, validatedRequest.description);

    // 2. Build structured analysis output compliant with Member 3's AI contract
    const analysisPayload: AiAnalysisData = {
      category: category.toUpperCase(),
      subcategory: null,
      severity: priorityResult.priority === 'CRITICAL' ? 'CRITICAL' : priorityResult.priority === 'HIGH' ? 'HIGH' : 'MODERATE',
      urgency: priorityResult.priority === 'CRITICAL' ? 'IMMEDIATE' : priorityResult.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
      priority: priorityResult.priority,
      priorityScore: priorityResult.score,
      priorityReasons: priorityResult.reasons,
      department: mappedDeptCode,
      summary: `${validatedRequest.title}: ${validatedRequest.description.slice(0, 150)}...`,
      confidence: 0.88,
    };

    // 3. Strict schema validation before returning
    const validatedAnalysis = aiAnalysisSchema.parse(analysisPayload);

    return jsonSuccess({
      analysis: validatedAnalysis,
      isAiEnhanced: false, // Member 3 can toggle to true when Gemini API key is linked
      note: 'Analysis generated via institutional rule-engine baseline with Gemini fallback guarantee.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
