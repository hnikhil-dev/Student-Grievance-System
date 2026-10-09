import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_URL || 'https://kvrerxalgepbjjuqcacs.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmVyeGFsZ2VwYmpqdXFjYWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NDc1OTYsImV4cCI6MjEwNzAyMzU5Nn0.mb_cRCu6KL4uri31HpNw6FpwG0b--vFQFAXRlSdoc5s';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Hook to listen for live grievance updates (status changes, assignments, resolutions)
 */
export function useRealtimeGrievances(onUpdate: (payload: any) => void) {
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const channelId = `realtime-grievances-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabaseClient
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grievances' },
        (payload: any) => {
          onUpdateRef.current?.(payload);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);
}

export function useRealtimeNotifications(
  userId?: string | null,
  onNotification?: (payload: any) => void
) {
  const onNotificationRef = useRef(onNotification);
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!userId) return;

    const channelId = `realtime-notifications-${userId}-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabaseClient
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          onNotificationRef.current?.(payload);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId]);
}
