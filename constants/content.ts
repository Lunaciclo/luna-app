import { Phase } from '../types/cycle';

interface PhaseInsight {
  tag: string;
  title: string;
  icon: string;
}

interface PhaseContent {
  heroTitle: string;
  heroSub: string;
  editorialTitle: string;
  insights: PhaseInsight[];
  lunaAIGreeting: string;
  partnerTip: string;
}

export const PHASE_CONTENT: Record<Phase, PhaseContent> = {
  menstrual: {
    heroTitle: 'Menstruação',
    heroSub: 'Dia {day} do ciclo',
    editorialTitle: 'Durante sua menstruação',
    insights: [
      { tag: 'CÓLICAS', title: '3 razões para cólicas', icon: '🩸' },
      { tag: 'ALIMENTAÇÃO', title: 'Alimentos que ajudam no período', icon: '🥗' },
      { tag: 'DESCANSO', title: 'Por que você precisa de mais sono agora', icon: '😴' },
    ],
    lunaAIGreeting: 'Ei {name}, você está na fase menstrual. Como está se sentindo? 🩸',
    partnerTip: 'Ela pode precisar de mais descanso e carinho hoje 🩸',
  },
  follicular: {
    heroTitle: 'Fase Folicular',
    heroSub: 'Energia crescente 🌱',
    editorialTitle: 'Sua fase folicular',
    insights: [
      { tag: 'ENERGIA', title: 'Por que você está mais criativa agora', icon: '🌱' },
      { tag: 'EXERCÍCIO', title: 'Melhor fase para treinos intensos', icon: '💪' },
      { tag: 'TRABALHO', title: 'Aproveite o pico cognitivo', icon: '🧠' },
    ],
    lunaAIGreeting: '{name}, você está na fase folicular — sua energia está aumentando! 🌱',
    partnerTip: 'Ótimo momento para planejar atividades juntos 🌱',
  },
  ovulatory: {
    heroTitle: 'Fase Ovulatória',
    heroSub: 'Pico de energia ⚡',
    editorialTitle: 'Seus dias férteis',
    insights: [
      { tag: 'FERTILIDADE', title: 'Entendendo sua janela fértil', icon: '⚡' },
      { tag: 'ENERGIA', title: 'Você está no seu pico — aproveite!', icon: '✨' },
      { tag: 'SOCIAL', title: 'Por que você é mais comunicativa agora', icon: '💬' },
    ],
    lunaAIGreeting: '{name}, você está ovulando! Este é seu momento de maior energia ⚡',
    partnerTip: 'Ela está no pico de energia e comunicação ⚡',
  },
  luteal: {
    heroTitle: 'Fase Lútea',
    heroSub: 'Introspectiva 🌧️',
    editorialTitle: 'Fase pré-menstrual',
    insights: [
      { tag: 'TPM', title: 'Por que você pode se sentir diferente', icon: '🌧️' },
      { tag: 'AUTOCUIDADO', title: 'Rituais de autocuidado para a fase lútea', icon: '🛁' },
      { tag: 'ALIMENTAÇÃO', title: 'O que comer para reduzir TPM', icon: '🫐' },
    ],
    lunaAIGreeting: '{name}, você está na fase lútea. Autocuidado em primeiro lugar 🌧️',
    partnerTip: 'Ela pode precisar de mais compreensão e espaço agora 🌧️',
  },
};

export const PARTNER_TIPS: Record<Phase, { tip: string; activities: string[] }> = {
  menstrual: {
    tip: 'Ela está menstruando. Ela pode precisar de mais descanso e carinho.',
    activities: ['Preparar uma compressa quente', 'Assistir algo juntos', 'Dar espaço se precisar'],
  },
  follicular: {
    tip: 'Fase de energia crescente! Ótimo momento para planejar coisas juntos.',
    activities: ['Propor uma atividade nova', 'Conversar sobre planos', 'Treino em casal'],
  },
  ovulatory: {
    tip: 'Ela está no pico de energia e comunicação. Aproveite esse momento!',
    activities: ['Sair para um encontro', 'Conversa profunda', 'Atividade física juntos'],
  },
  luteal: {
    tip: 'Fase pré-menstrual. Ela pode estar mais sensível — paciência e compreensão são chave.',
    activities: ['Dar espaço quando necessário', 'Preparar algo especial', 'Ouvir sem julgamento'],
  },
};
