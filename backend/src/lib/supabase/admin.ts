import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

export interface DatabaseState {
  departments: any[];
  sla_rules: any[];
  profiles: any[];
  grievances: any[];
  grievance_status_history: any[];
  grievance_comments: any[];
  grievance_attachments: any[];
  grievance_assignments: any[];
  grievance_escalations: any[];
  grievance_clusters: any[];
  notifications: any[];
  grievance_feedback: any[];
  grievance_evidence: any[];
  agent_execution_logs: any[];
}

const DEFAULT_DEPARTMENTS = [
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'Information Technology', code: 'IT', description: 'Campus network, LMS, lab workstations, Wi-Fi and student portal services', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'a0000000-0000-0000-0000-000000000002', name: 'Academic Affairs', code: 'ACADEMICS', description: 'Course registration, grading queries, hall tickets, timetable and examinations', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'a0000000-0000-0000-0000-000000000003', name: 'Hostel & Housing', code: 'HOSTEL', description: 'Hostel rooms, water heaters, hygiene, mess coordination and security', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'a0000000-0000-0000-0000-000000000004', name: 'Campus Maintenance', code: 'MAINTENANCE', description: 'Civil, electrical, plumbing, sanitation and classroom infrastructure', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'a0000000-0000-0000-0000-000000000005', name: 'Transport Services', code: 'TRANSPORT', description: 'College shuttle buses, route timings, driver grievances and passes', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'a0000000-0000-0000-0000-000000000006', name: 'Central Library', code: 'LIBRARY', description: 'Digital repository, book returns, study halls, noise control and journal access', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'a0000000-0000-0000-0000-000000000007', name: 'Administration', code: 'ADMINISTRATION', description: 'Fee clearance, scholarships, certificates, ID cards and identity documents', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'a0000000-0000-0000-0000-000000000008', name: 'Canteen & Food Services', code: 'CANTEEN', description: 'Cafeteria food hygiene, nutrition, pricing and cafeteria cleanliness', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'a0000000-0000-0000-0000-000000000009', name: 'Student Affairs', code: 'STUDENT_AFFAIRS', description: 'Clubs, cultural events, anti-ragging cell, grievance council and welfare', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const DEFAULT_SLA_RULES = [
  { id: 'b0000000-0000-0000-0000-000000000001', priority: 'CRITICAL', default_hours: 4, warning_threshold_percent: 75, escalation_role: 'DEPARTMENT_ADMIN', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000002', priority: 'HIGH', default_hours: 12, warning_threshold_percent: 75, escalation_role: 'DEPARTMENT_ADMIN', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000003', priority: 'MEDIUM', default_hours: 24, warning_threshold_percent: 75, escalation_role: 'DEPARTMENT_ADMIN', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000004', priority: 'LOW', default_hours: 48, warning_threshold_percent: 75, escalation_role: 'DEPARTMENT_ADMIN', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const DEFAULT_PROFILES = [
  { id: '00000000-0000-0000-0000-000000000001', full_name: 'Dr. Sarah Jenkins', email: 'superadmin@campus.edu', role: 'SUPER_ADMIN', department_id: null, student_id: null, phone: '+1-555-0101', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000002', full_name: 'Prof. Alan Vance', email: 'admin.it@campus.edu', role: 'DEPARTMENT_ADMIN', department_id: 'a0000000-0000-0000-0000-000000000001', student_id: null, phone: '+1-555-0102', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000003', full_name: 'Col. Ramesh Roy', email: 'admin.hostel@campus.edu', role: 'DEPARTMENT_ADMIN', department_id: 'a0000000-0000-0000-0000-000000000003', student_id: null, phone: '+1-555-0103', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000004', full_name: 'Mark Sterling', email: 'officer.it@campus.edu', role: 'OFFICER', department_id: 'a0000000-0000-0000-0000-000000000001', student_id: null, phone: '+1-555-0104', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000005', full_name: 'Deepa Sharma', email: 'officer.hostel@campus.edu', role: 'OFFICER', department_id: 'a0000000-0000-0000-0000-000000000003', student_id: null, phone: '+1-555-0105', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000006', full_name: 'Alex Mercer', email: 'student.alex@campus.edu', role: 'STUDENT', department_id: null, student_id: 'CS-2023-014', phone: '+1-555-0106', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000007', full_name: 'Priya Nair', email: 'student.priya@campus.edu', role: 'STUDENT', department_id: null, student_id: 'EC-2023-088', phone: '+1-555-0107', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000008', full_name: 'Rahul Verma', email: 'student.rahul@campus.edu', role: 'STUDENT', department_id: null, student_id: 'ME-2022-032', phone: '+1-555-0108', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

function getDbFilePath(): string {
  const baseDir = path.resolve(process.cwd(), '.data');
  if (!fs.existsSync(baseDir)) {
    try {
      fs.mkdirSync(baseDir, { recursive: true });
    } catch {}
  }
  return path.join(baseDir, 'institutional_db.json');
}

let inMemoryDb: DatabaseState | null = null;

function loadDatabaseState(): DatabaseState {
  if (inMemoryDb) return inMemoryDb;

  const filePath = getDbFilePath();
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      inMemoryDb = {
        departments: parsed.departments || DEFAULT_DEPARTMENTS,
        sla_rules: parsed.sla_rules || DEFAULT_SLA_RULES,
        profiles: parsed.profiles || DEFAULT_PROFILES,
        grievances: parsed.grievances || [],
        grievance_status_history: parsed.grievance_status_history || [],
        grievance_comments: parsed.grievance_comments || [],
        grievance_attachments: parsed.grievance_attachments || [],
        grievance_assignments: parsed.grievance_assignments || [],
        grievance_escalations: parsed.grievance_escalations || [],
        grievance_clusters: parsed.grievance_clusters || [],
        notifications: parsed.notifications || [],
        grievance_feedback: parsed.grievance_feedback || [],
        grievance_evidence: parsed.grievance_evidence || [],
        agent_execution_logs: parsed.agent_execution_logs || [],
      };
      return inMemoryDb;
    } catch (err) {
      console.warn('[DB_LOAD_NOTICE] Error parsing existing db, initializing defaults:', err);
    }
  }

  inMemoryDb = {
    departments: [...DEFAULT_DEPARTMENTS],
    sla_rules: [...DEFAULT_SLA_RULES],
    profiles: [...DEFAULT_PROFILES],
    grievances: [],
    grievance_status_history: [],
    grievance_comments: [],
    grievance_attachments: [],
    grievance_assignments: [],
    grievance_escalations: [],
    grievance_clusters: [],
    notifications: [],
    grievance_feedback: [],
    grievance_evidence: [],
    agent_execution_logs: [],
  };

  saveDatabaseState(inMemoryDb);
  return inMemoryDb;
}

function saveDatabaseState(state: DatabaseState): void {
  try {
    const filePath = getDbFilePath();
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB_SAVE_ERROR] Failed to persist database state:', err);
  }
}

let ticketSequence = 1;

function getNextTicketNumber(): string {
  const db = loadDatabaseState();
  const year = new Date().getFullYear();
  const highest = db.grievances.reduce((max, g) => {
    const match = String(g.ticket_number || '').match(/GRV-\d{4}-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);

  const nextNum = Math.max(highest + 1, ticketSequence++);
  return `GRV-${year}-${String(nextNum).padStart(5, '0')}`;
}

class AuthoritativeQueryBuilder {
  private tableName: string;
  private action: 'SELECT' | 'INSERT' | 'UPDATE' | 'UPSERT' | 'DELETE' = 'SELECT';
  private selectCols?: string;
  private selectOpts?: { count?: string };
  private insertData?: any;
  private updateData?: any;
  private upsertData?: any;
  private upsertOpts?: { onConflict?: string };
  private filters: Array<(row: any) => boolean> = [];
  private orderCol?: string;
  private orderAscending = true;
  private rangeFrom = 0;
  private rangeTo?: number;
  private limitCount?: number;
  private isSingle = false;
  private isMaybeSingle = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns = '*', options?: { count?: string }) {
    if (this.action !== 'INSERT' && this.action !== 'UPDATE' && this.action !== 'UPSERT') {
      this.action = 'SELECT';
    }
    this.selectCols = columns;
    this.selectOpts = options;
    return this;
  }

  insert(data: any) {
    this.action = 'INSERT';
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.action = 'UPDATE';
    this.updateData = data;
    return this;
  }

  upsert(data: any, options?: { onConflict?: string }) {
    this.action = 'UPSERT';
    this.upsertData = data;
    this.upsertOpts = options;
    return this;
  }

  delete() {
    this.action = 'DELETE';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push((row) => row[column] > value);
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((row) => row[column] >= value);
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push((row) => row[column] < value);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((row) => row[column] <= value);
    return this;
  }

  is(column: string, value: any) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((row) => Array.isArray(values) && values.includes(row[column]));
    return this;
  }

  like(column: string, pattern: string) {
    const regex = new RegExp('^' + pattern.replace(/%/g, '.*') + '$');
    this.filters.push((row) => regex.test(String(row[column] || '')));
    return this;
  }

  ilike(column: string, pattern: string) {
    const cleanPattern = pattern.replace(/%/g, '.*');
    const regex = new RegExp('^' + cleanPattern + '$', 'i');
    this.filters.push((row) => regex.test(String(row[column] || '')));
    return this;
  }

  or(filterStr: string) {
    const subClauses = filterStr.split(',').map((s) => s.trim()).filter(Boolean);
    if (subClauses.length > 0) {
      this.filters.push((row) => {
        return subClauses.some((clause) => {
          const parts = clause.split('.');
          if (parts.length >= 3) {
            const col = parts[0];
            const op = parts[1];
            const val = parts.slice(2).join('.');
            if (op === 'eq') return String(row[col]) === val;
            if (op === 'neq') return String(row[col]) !== val;
            if (op === 'ilike') {
              const cleaned = val.replace(/%/g, '.*');
              return new RegExp(cleaned, 'i').test(String(row[col] || ''));
            }
          }
          return false;
        });
      });
    }
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAscending = options?.ascending !== false;
    return this;
  }

  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  private enrichRow(row: any, state: DatabaseState): any {
    const copy = { ...row };

    if (this.tableName === 'grievances') {
      // Join department
      if (copy.department_id) {
        copy.department = state.departments.find((d) => d.id === copy.department_id) || null;
      } else {
        copy.department = null;
      }

      // Join assignee
      if (copy.assigned_to) {
        copy.assignee = state.profiles.find((p) => p.id === copy.assigned_to) || null;
      } else {
        copy.assignee = null;
      }

      // Join student
      if (copy.student_id) {
        copy.student = state.profiles.find((p) => p.id === copy.student_id) || null;
      } else {
        copy.student = null;
      }

      // Join comments
      if (this.selectCols && this.selectCols.includes('comments')) {
        copy.comments = state.grievance_comments
          .filter((c) => c.grievance_id === copy.id)
          .map((c) => ({
            ...c,
            author: state.profiles.find((p) => p.id === c.user_id) || null,
          }));
      }

      // Join attachments
      if (this.selectCols && this.selectCols.includes('attachments')) {
        copy.attachments = state.grievance_attachments.filter((a) => a.grievance_id === copy.id);
      }

      // Join history
      if (this.selectCols && this.selectCols.includes('history')) {
        copy.history = state.grievance_status_history
          .filter((h) => h.grievance_id === copy.id)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
    }

    if (this.tableName === 'grievance_comments') {
      if (copy.user_id) {
        copy.author = state.profiles.find((p) => p.id === copy.user_id) || null;
      }
    }

    return copy;
  }

  async execute(): Promise<{ data: any; count: number | null; error: any }> {
    const state = loadDatabaseState();
    const tableKey = this.tableName as keyof DatabaseState;
    if (!state[tableKey]) {
      (state as any)[tableKey] = [];
    }
    const tableArray: any[] = state[tableKey] as any[];

    if (this.action === 'INSERT') {
      const items = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const insertedRows: any[] = [];

      for (const item of items) {
        const row = { ...item };
        if (!row.id) {
          row.id = crypto.randomUUID();
        }
        if (this.tableName === 'grievances' && !row.ticket_number) {
          row.ticket_number = getNextTicketNumber();
        }
        if (!row.created_at) {
          row.created_at = new Date().toISOString();
        }
        if (!row.updated_at) {
          row.updated_at = new Date().toISOString();
        }
        tableArray.unshift(row);
        insertedRows.push(row);
      }

      saveDatabaseState(state);

      if (this.isSingle) {
        return { data: insertedRows[0] ? this.enrichRow(insertedRows[0], state) : null, count: null, error: null };
      }
      return { data: Array.isArray(this.insertData) ? insertedRows.map((r) => this.enrichRow(r, state)) : (insertedRows[0] ? this.enrichRow(insertedRows[0], state) : null), count: null, error: null };
    }

    if (this.action === 'UPDATE') {
      let matchedCount = 0;
      let updatedFirst: any = null;

      for (let i = 0; i < tableArray.length; i++) {
        const row = tableArray[i];
        const matches = this.filters.every((fn) => fn(row));
        if (matches) {
          const updated = {
            ...row,
            ...this.updateData,
            updated_at: new Date().toISOString(),
          };
          tableArray[i] = updated;
          matchedCount++;
          if (!updatedFirst) updatedFirst = updated;
        }
      }

      saveDatabaseState(state);

      if (this.isSingle) {
        if (!updatedFirst) {
          return { data: null, count: null, error: new Error(`Row not found for update`) };
        }
        return { data: this.enrichRow(updatedFirst, state), count: null, error: null };
      }
      return { data: updatedFirst ? this.enrichRow(updatedFirst, state) : null, count: matchedCount, error: null };
    }

    if (this.action === 'UPSERT') {
      const items = Array.isArray(this.upsertData) ? this.upsertData : [this.upsertData];
      const conflictCol = this.upsertOpts?.onConflict || 'id';
      const results: any[] = [];

      for (const item of items) {
        const idx = tableArray.findIndex((r) => r[conflictCol] === item[conflictCol]);
        if (idx !== -1) {
          tableArray[idx] = { ...tableArray[idx], ...item, updated_at: new Date().toISOString() };
          results.push(tableArray[idx]);
        } else {
          const newRow = {
            id: item.id || crypto.randomUUID(),
            ...item,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          tableArray.push(newRow);
          results.push(newRow);
        }
      }

      saveDatabaseState(state);
      return { data: Array.isArray(this.upsertData) ? results : results[0], count: results.length, error: null };
    }

    if (this.action === 'DELETE') {
      const initialLen = tableArray.length;
      const remaining = tableArray.filter((row) => !this.filters.every((fn) => fn(row)));
      state[tableKey] = remaining as any;
      saveDatabaseState(state);
      return { data: null, count: initialLen - remaining.length, error: null };
    }

    // Default: SELECT
    let matching = tableArray.filter((row) => this.filters.every((fn) => fn(row)));
    const totalCount = matching.length;

    // Order
    if (this.orderCol) {
      const col = this.orderCol;
      const asc = this.orderAscending;
      matching.sort((a, b) => {
        const va = a[col];
        const vb = b[col];
        if (va === vb) return 0;
        if (va == null) return asc ? 1 : -1;
        if (vb == null) return asc ? -1 : 1;
        if (typeof va === 'string' && typeof vb === 'string') {
          return asc ? va.localeCompare(vb) : vb.localeCompare(va);
        }
        return asc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
    }

    // Pagination / Slicing
    if (this.rangeTo !== undefined) {
      matching = matching.slice(this.rangeFrom, this.rangeTo + 1);
    } else if (this.limitCount !== undefined) {
      matching = matching.slice(0, this.limitCount);
    }

    // Joins & Enrichment
    const enriched = matching.map((row) => this.enrichRow(row, state));

    if (this.isSingle) {
      if (enriched.length === 0) {
        return { data: null, count: null, error: { message: `No rows found in ${this.tableName}`, code: 'PGRST116' } };
      }
      return { data: enriched[0], count: null, error: null };
    }

    if (this.isMaybeSingle) {
      return { data: enriched[0] || null, count: null, error: null };
    }

    return {
      data: enriched,
      count: this.selectOpts?.count === 'exact' ? totalCount : null,
      error: null,
    };
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class AuthoritativeSupabaseEngine {
  from(tableName: string) {
    return new AuthoritativeQueryBuilder(tableName);
  }

  storage = {
    from(bucketName: string) {
      return {
        async upload(storagePath: string, fileBuffer: Buffer | Uint8Array | string, options?: any) {
          const uploadsDir = path.resolve(process.cwd(), '.data', 'uploads', bucketName);
          if (!fs.existsSync(uploadsDir)) {
            try {
              fs.mkdirSync(uploadsDir, { recursive: true });
            } catch {}
          }
          const targetFile = path.join(uploadsDir, path.basename(storagePath));
          try {
            fs.writeFileSync(targetFile, fileBuffer as any);
          } catch {}
          return { data: { path: storagePath }, error: null };
        },
        getPublicUrl(storagePath: string) {
          return { data: { publicUrl: `/api/evidence/${encodeURIComponent(storagePath)}` } };
        },
        async list() {
          return { data: [], error: null };
        },
      };
    },
    async listBuckets() {
      return { data: [{ name: 'grievance-files' }], error: null };
    },
    async createBucket(name: string) {
      return { data: { name }, error: null };
    },
  };
}

let liveAdminClient: SupabaseClient<any> | null = null;
let authoritativeEngineInstance: any = null;

export function getAdminClient(): SupabaseClient<any> | any {
  if (process.env.USE_LOCAL_DB === 'true') {
    if (!authoritativeEngineInstance) {
      authoritativeEngineInstance = new AuthoritativeSupabaseEngine();
    }
    return authoritativeEngineInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('localhost')) {
    if (!liveAdminClient) {
      liveAdminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
    return liveAdminClient;
  }

  if (!authoritativeEngineInstance) {
    authoritativeEngineInstance = new AuthoritativeSupabaseEngine();
  }
  return authoritativeEngineInstance;
}

