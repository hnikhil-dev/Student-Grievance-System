export const DEFAULT_DEPARTMENTS = [
  { name: 'Information Technology', code: 'IT' },
  { name: 'Academic Affairs', code: 'ACADEMICS' },
  { name: 'Hostel & Housing', code: 'HOSTEL' },
  { name: 'Campus Maintenance', code: 'MAINTENANCE' },
  { name: 'Transport Services', code: 'TRANSPORT' },
  { name: 'Central Library', code: 'LIBRARY' },
  { name: 'Administration', code: 'ADMINISTRATION' },
  { name: 'Canteen & Food Services', code: 'CANTEEN' },
  { name: 'Student Affairs', code: 'STUDENT_AFFAIRS' },
] as const;

export type DepartmentCode = (typeof DEFAULT_DEPARTMENTS)[number]['code'];
