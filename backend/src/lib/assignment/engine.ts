import { DepartmentCode } from '@/constants/departments';

interface DepartmentRule {
  code: DepartmentCode;
  keywords: string[];
}

const ROUTING_RULES: DepartmentRule[] = [
  {
    code: 'IT',
    keywords: ['wifi', 'wi-fi', 'network', 'internet', 'portal', 'lms', 'lab', 'computer', 'server', 'email', 'software', 'login', 'bug'],
  },
  {
    code: 'ACADEMICS',
    keywords: ['exam', 'grade', 'marks', 'attendance', 'midterm', 'professor', 'course', 'curriculum', 'hall ticket', 'evaluation', 'results', 'transcript'],
  },
  {
    code: 'HOSTEL',
    keywords: ['hostel', 'room', 'warden', 'mess', 'bed', 'cooler', 'geyser', 'hot water', 'washroom', 'roommate', 'block'],
  },
  {
    code: 'MAINTENANCE',
    keywords: ['leak', 'fan', 'ac', 'air conditioning', 'switch', 'light', 'electric', 'plumbing', 'pipe', 'door', 'window', 'ceiling', 'lift', 'elevator', 'spark'],
  },
  {
    code: 'TRANSPORT',
    keywords: ['bus', 'shuttle', 'route', 'driver', 'transport', 'commute', 'pickup', 'metro'],
  },
  {
    code: 'LIBRARY',
    keywords: ['library', 'book', 'reading room', 'journal', 'fine', 'librarian', 'borrow', 'return'],
  },
  {
    code: 'CANTEEN',
    keywords: ['canteen', 'food', 'cafeteria', 'lunch', 'dinner', 'snack', 'hygiene', 'plate', 'cutlery', 'taste', 'price'],
  },
  {
    code: 'ADMINISTRATION',
    keywords: ['fee', 'scholarship', 'id card', 'certificate', 'clearance', 'bursar', 'office', 'receipt', 'bonafide'],
  },
  {
    code: 'STUDENT_AFFAIRS',
    keywords: ['club', 'ragging', 'harassment', 'sports', 'gym', 'cultural', 'fest', 'council', 'welfare'],
  },
];

/**
 * Deterministically routes a grievance category/description to the appropriate Department Code.
 */
export function determineDepartmentCode(category: string, title = '', description = ''): DepartmentCode {
  const normCategory = category.trim().toUpperCase();

  // Direct exact code match
  const exact = ROUTING_RULES.find((r) => r.code === normCategory);
  if (exact) return exact.code;

  // Keyword score matching across title, category, description
  const combined = `${category} ${title} ${description}`.toLowerCase();

  let bestMatch: DepartmentCode = 'ADMINISTRATION';
  let highestScore = 0;

  for (const rule of ROUTING_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (combined.includes(kw)) {
        score += 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = rule.code;
    }
  }

  return bestMatch;
}
