import { useMemo } from 'react';
import { useCycleStore } from '../store/useCycleStore';
import { PHASE_META } from '../constants/phases';
import { PHASE_CONTENT } from '../constants/content';
import { Colors } from '../theme/colors';

export function useCurrentPhase() {
  const { currentPhase, dayOfCycle, daysUntilPeriod, cycleData } =
    useCycleStore();

  return useMemo(() => {
    const meta = PHASE_META[currentPhase];
    const content = PHASE_CONTENT[currentPhase];
    const gradientColors = Colors.gradients.hero[currentPhase];

    return {
      phase: currentPhase,
      dayOfCycle,
      daysUntilPeriod,
      meta,
      content,
      gradientColors,
      phaseColor: meta.color,
      heroTitle: content.heroTitle,
      heroSub: content.heroSub.replace('{day}', String(dayOfCycle)),
    };
  }, [currentPhase, dayOfCycle, daysUntilPeriod]);
}
