import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kvrerxalgepbjjuqcacs.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmVyeGFsZ2VwYmpqdXFjYWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NDc1OTYsImV4cCI6MjEwNzAyMzU5Nn0.mb_cRCu6KL4uri31HpNw6FpwG0b--vFQFAXRlSdoc5s';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Hook to listen for live grievance updates (status changes, assignments, resolutions)
 */
export function useRealtimeGrievances(onUpdate: (payload: any) => void) {
  useEffect(() => {
    const channel = supabaseClient
      .channel('realtime-grievances')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grievances' },
        (payload: any) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [onUpdate]);
}

/**
 * Hook to listen for live user notifications
 */
export function useRealtimeNotifications(userId: string, onNotification: (payload: any) => void) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabaseClient
      .channel(`realtime-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          onNotification(payload);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId, onNotification]);
}
