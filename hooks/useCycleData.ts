import { useEffect } from 'react';
import { useCycleStore } from '../store/useCycleStore';
import { useUserStore } from '../store/useUserStore';
import { supabase } from '../lib/supabase';
import { CycleData } from '../types/cycle';
import { format } from 'date-fns';

export function useCycleData() {
  const { profile } = useUserStore();
  const { setCycleData, setTodayLog, cycleData, todayLog } = useCycleStore();

  useEffect(() => {
    if (!profile?.id) return;

    async function fetchCycleData() {
      // Fetch current cycle
      const { data: cycles } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', profile!.id)
        .eq('is_current', true)
        .limit(1)
        .single();

      if (cycles) {
        const data: CycleData = {
          lastPeriodStart: new Date(cycles.start_date),
          cycleLength: cycles.cycle_length ?? 28,
          flowLength: cycles.flow_length ?? 5,
        };
        setCycleData(data);
      }

      // Fetch today's log
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: log } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', profile!.id)
        .eq('log_date', today)
        .limit(1)
        .single();

      if (log) {
        setTodayLog({
          id: log.id,
          userId: log.user_id,
          logDate: log.log_date,
          phase: log.phase,
          symptoms: log.symptoms ?? [],
          moods: log.moods ?? [],
          flowIntensity: log.flow_intensity,
          waterMl: log.water_ml,
          weightKg: log.weight_kg,
          sleepHours: log.sleep_hours,
          steps: log.steps,
          basalTemp: log.basal_temp,
          notes: log.notes,
          sexualActivity: log.sexual_activity ?? false,
          createdAt: log.created_at,
        });
      }
    }

    fetchCycleData();
  }, [profile?.id]);

  return { cycleData, todayLog };
}
