export const Colors = {
  // Primárias
  rose: '#F2637A',
  coral: '#FF8A70',
  peach: '#FFB896',
  plum: '#9B2D6B',

  // Neutras
  cream: '#FFF8F5',
  blush: '#FFF0F3',
  text: '#2D1B2E',
  textLight: '#8B7080',

  // Funcional
  green: '#2ECC89',
  white: '#FFFFFF',

  // Fases (uso programático)
  phases: {
    menstrual: '#F2637A',
    follicular: '#2ECC89',
    ovulatory: '#FF8A70',
    luteal: '#9B2D6B',
  },

  // Gradientes
  gradients: {
    paywall: ['#9B2D6B', '#F2637A'] as const,
    celebration: ['#9B2D6B', '#FF8A70', '#F2637A'] as const,
    hero: {
      menstrual: ['#F2637A', '#FFB896'] as const,
      follicular: ['#2ECC89', '#FFF8F5'] as const,
      ovulatory: ['#FF8A70', '#FFB896'] as const,
      luteal: ['#9B2D6B', '#F2637A'] as const,
    },
  },
} as const;
