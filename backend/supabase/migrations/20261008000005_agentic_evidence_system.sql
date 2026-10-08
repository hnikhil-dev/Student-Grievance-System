-- ==============================================================================
-- SMART STUDENT GRIEVANCE MANAGEMENT SYSTEM
-- Migration 05: Autonomous Multi-Agent Pipeline & Tamper-Proof Evidence Vault
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: grievance_evidence (Tamper-Proof Multimodal Evidence Vault)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS grievance_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    sha256_hash TEXT NOT NULL,                             -- Cryptographic integrity checksum
    evidence_type TEXT NOT NULL DEFAULT 'PHOTO',          -- 'PHOTO', 'RECEIPT', 'DOCUMENT', 'SCREENSHOT'
    is_resolution_proof BOOLEAN NOT NULL DEFAULT false,    -- True if submitted by officer as proof of fix
    ai_analyzed BOOLEAN NOT NULL DEFAULT false,
    ai_description TEXT,                                   -- Multimodal visual diagnosis description
    relevance_score INTEGER CHECK (relevance_score IS NULL OR (relevance_score >= 0 AND relevance_score <= 100)),
    authenticity_status TEXT NOT NULL DEFAULT 'PENDING'    -- 'PENDING', 'VERIFIED', 'SUSPICIOUS', 'INCONCLUSIVE'
        CHECK (authenticity_status IN ('PENDING', 'VERIFIED', 'SUSPICIOUS', 'INCONCLUSIVE')),
    agent_confidence NUMERIC(4,3) CHECK (agent_confidence IS NULL OR (agent_confidence >= 0 AND agent_confidence <= 1)),
    verification_notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TABLE: agent_execution_logs (Live Agent Reasoning & Decision Traces)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS agent_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL                              -- 'TRIAGE_AGENT', 'EVIDENCE_AGENT', 'SLA_SENTINEL', 'RESOLUTION_VERIFIER'
        CHECK (agent_name IN ('TRIAGE_AGENT', 'EVIDENCE_AGENT', 'SLA_SENTINEL', 'RESOLUTION_VERIFIER')),
    action_taken TEXT NOT NULL,
    thought_process TEXT NOT NULL,                         -- Explainable Chain-of-Thought for judges
    confidence NUMERIC(4,3) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES FOR HIGH-THROUGHPUT AGENT QUERIES
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_evidence_grievance ON grievance_evidence(grievance_id);
CREATE INDEX IF NOT EXISTS idx_evidence_sha256 ON grievance_evidence(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_evidence_authenticity ON grievance_evidence(authenticity_status);
CREATE INDEX IF NOT EXISTS idx_agent_logs_grievance ON agent_execution_logs(grievance_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_execution_logs(agent_name);

-- ------------------------------------------------------------------------------
-- 4. REALTIME REPLICATION FOR AGENT LOGS & EVIDENCE
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE grievance_evidence;
    ALTER PUBLICATION supabase_realtime ADD TABLE agent_execution_logs;
  END IF;
END $$;

ALTER TABLE grievance_evidence REPLICA IDENTITY FULL;
ALTER TABLE agent_execution_logs REPLICA IDENTITY FULL;

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE grievance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY;

-- Evidence Policies
DROP POLICY IF EXISTS "Evidence: View permitted grievance evidence" ON grievance_evidence;
CREATE POLICY "Evidence: View permitted grievance evidence"
ON grievance_evidence FOR SELECT
TO authenticated
USING (can_view_grievance(grievance_id));

DROP POLICY IF EXISTS "Evidence: Authenticated upload" ON grievance_evidence;
CREATE POLICY "Evidence: Authenticated upload"
ON grievance_evidence FOR INSERT
TO authenticated
WITH CHECK (
    uploaded_by = auth.uid()
    AND can_view_grievance(grievance_id)
);

-- Agent Logs Policies (Admins/Staff and Grievance Owners can observe agent reasoning)
DROP POLICY IF EXISTS "Agent Logs: View reasoning logs" ON agent_execution_logs;
CREATE POLICY "Agent Logs: View reasoning logs"
ON agent_execution_logs FOR SELECT
TO authenticated
USING (can_view_grievance(grievance_id));

-- ------------------------------------------------------------------------------
-- 6. SEED DEMO AGENT REASONING TRACES (INSTANT VISUALS FOR JUDGES)
-- ------------------------------------------------------------------------------

-- Seed Evidence for Lab 3 Core Switch Failure (Ticket 1)
INSERT INTO grievance_evidence (
    id, grievance_id, uploaded_by, file_path, file_name, file_type, file_size,
    sha256_hash, evidence_type, is_resolution_proof, ai_analyzed, ai_description,
    relevance_score, authenticity_status, agent_confidence, verification_notes
) VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000006',
    'grievance-files/evidence_switch_burn.jpg',
    'evidence_switch_burn.jpg',
    'image/jpeg',
    241284,
    'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    'PHOTO',
    false,
    true,
    'Visual evidence inspects a 48-port Cisco Gigabit switch chassis in Lab 3 server rack with power indicator LED off and charring on power supply socket.',
    96,
    'VERIFIED',
    0.954,
    'Evidence Agent verified: Visual elements match reported Lab 3 switch burnout. SHA-256 integrity stamped.'
) ON CONFLICT (id) DO NOTHING;

-- Seed Agent Execution Reasoning Traces for Ticket 1
INSERT INTO agent_execution_logs (
    grievance_id, agent_name, action_taken, thought_process, confidence, metadata
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'TRIAGE_AGENT',
    'CLASSIFY_AND_SCORE',
    'Detected severe infrastructure disruption affecting Engineering Block B Lab 3 during final capstone project submission window. Impact cohort estimated at 60 active workstations. Urgency escalated to IMMEDIATE due to deadline within 24h. Routed autonomously to IT Infrastructure Department.',
    0.965,
    '{"category": "IT", "priority": "CRITICAL", "priorityScore": 95, "affected_students": 60}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000001',
    'EVIDENCE_AGENT',
    'MULTIMODAL_VERIFICATION',
    'Executed visual inspection on attached photo evidence_switch_burn.jpg. Computed SHA-256 fingerprint a1b2c3d4... Cryptographic integrity valid. Image content confirms hardware burnout at power distribution unit. Relevance score: 96/100.',
    0.954,
    '{"authenticity": "VERIFIED", "relevance_score": 96, "sha256": "a1b2c3d4..."}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000001',
    'SLA_SENTINEL',
    'PATROL_AND_EVALUATE',
    'SLA target allocated: 4 hours. Current elapsed time: 2 hours (50%). Target deadline 2h remaining. Velocity check: Officer Mark Sterling accepted assignment and hardware swap is actively in progress. No intervention required at this cycle.',
    0.980,
    '{"elapsed_percent": 50, "sla_hours": 4, "is_overdue": false, "is_warning": false}'::jsonb
);

-- Seed Agent Reasoning Traces for Hostel Water Contamination (Ticket 2 - Escalated)
INSERT INTO agent_execution_logs (
    grievance_id, agent_name, action_taken, thought_process, confidence, metadata
) VALUES
(
    'c0000000-0000-0000-0000-000000000002',
    'TRIAGE_AGENT',
    'CLASSIFY_AND_SCORE',
    'Critical health and biohazard hazard detected: Yellow discolored drinking water in Girls Hostel Block D cooler. Over 120 residents dependent on water station. Flagged immediate medical risk.',
    0.990,
    '{"category": "HOSTEL", "priority": "CRITICAL", "priorityScore": 98, "affected_students": 120}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000002',
    'SLA_SENTINEL',
    'AUTO_ESCALATION_TRIGGER',
    'CRITICAL SLA BREACH DETECTED: 4-hour window expired with zero certified water sanitation clearance posted. Autonomously promoted status to ESCALATED. Dispatched urgent high-priority alert memo to Hostel Warden Col. Ramesh Roy.',
    0.995,
    '{"elapsed_percent": 125, "sla_breached": true, "escalated_to_role": "DEPARTMENT_ADMIN"}'::jsonb
);
