import { describe, it, expect } from 'vitest';
import { determineDepartmentCode } from '@/lib/assignment/engine';

describe('Smart Assignment Engine', () => {
  it('accurately routes IT-related issues to IT department', () => {
    const code = determineDepartmentCode('IT', 'Campus Wi-Fi connectivity dropped in Block B', 'Unable to connect to eduroam');
    expect(code).toBe('IT');
  });

  it('accurately routes Academic issues to ACADEMICS department', () => {
    const code = determineDepartmentCode('EXAMINATION', 'Midterm marks missing from portal', 'Database course midterm grade shows zero');
    expect(code).toBe('ACADEMICS');
  });

  it('accurately routes Hostel issues to HOSTEL department', () => {
    const code = determineDepartmentCode('FACILITY', 'Geyser leaking hot water in room 302', 'Hostel warden notified');
    expect(code).toBe('HOSTEL');
  });

  it('accurately routes Maintenance issues to MAINTENANCE department', () => {
    const code = determineDepartmentCode('ELECTRICAL', 'Ceiling fan emitting sparks', 'Spark observed during lecture');
    expect(code).toBe('MAINTENANCE');
  });

  it('accurately routes Transport issues to TRANSPORT department', () => {
    const code = determineDepartmentCode('BUS', 'Shuttle bus route 14 skipped morning stop', 'Students stranded at metro station');
    expect(code).toBe('TRANSPORT');
  });
});
