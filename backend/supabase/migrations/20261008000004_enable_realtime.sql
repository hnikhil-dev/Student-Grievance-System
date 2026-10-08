-- ==============================================================================
-- SMART STUDENT GRIEVANCE MANAGEMENT SYSTEM
-- Migration 04: Enable Supabase Realtime for Core Tables & Replica Identity
-- ==============================================================================

-- 1. Ensure supabase_realtime publication exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- 2. Add core tables to Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE grievances;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE grievance_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE grievance_status_history;

-- 3. Set Replica Identity to FULL
-- This ensures that both OLD and NEW row values are included in websocket payloads
ALTER TABLE grievances REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE grievance_comments REPLICA IDENTITY FULL;
ALTER TABLE grievance_status_history REPLICA IDENTITY FULL;
