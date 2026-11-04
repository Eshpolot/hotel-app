import { useCallback, useEffect, useRef, useState } from 'react';
import { roomSnapshot } from '../data/roomSnapshot';
import { supabase, type Room } from '../lib/supabase';

/** An empty live catalogue is authoritative; only network failures use the snapshot. */
export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>(roomSnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const version = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);
  const loadRooms = useCallback(async () => {
    const current = ++version.current;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    setLoading(true); setError(false);
    try {
      const result = await supabase.from('rooms').select('*').eq('is_active', true).order('id').abortSignal(controller.signal);
      if (result.error) throw result.error;
      if (current === version.current) setRooms(result.data || []);
    } catch {
      if (current === version.current) { setRooms(roomSnapshot); setError(true); }
    } finally {
      window.clearTimeout(timeout);
      if (current === version.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadRooms();
    return () => { version.current++; activeRequest.current?.abort(); };
  }, [loadRooms]);
  return { rooms, loading, error, loadRooms };
}
