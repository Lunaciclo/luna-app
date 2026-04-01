import { PhaseMeta, Phase } from '../types/cycle';

export const PHASE_META: Record<Phase, PhaseMeta> = {
  menstrual: {
    color: '#F2637A',
    emoji: '🩸',
    label: 'Menstrual',
    energy: 'Baixa',
    mood: 'Introspectiva',
    days: '1-5',
  },
  follicular: {
    color: '#2ECC89',
    emoji: '🌱',
    label: 'Folicular',
    energy: 'Crescente',
    mood: 'Criativa',
    days: '6-13',
  },
  ovulatory: {
    color: '#FF8A70',
    emoji: '⚡',
    label: 'Ovulatória',
    energy: 'Máxima',
    mood: 'Confiante',
    days: '14-16',
  },
  luteal: {
    color: '#9B2D6B',
    emoji: '🌧️',
    label: 'Lútea',
    energy: 'Variável',
    mood: 'Sensível',
    days: '17-28',
  },
};
