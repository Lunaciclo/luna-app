import { Plan } from '../types/subscription';

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Luna Free',
    price: 0,
    features: [
      'Rastreamento básico do ciclo',
      'Log de sintomas e humor',
      'Calendário do ciclo',
      'Previsões básicas',
      '1 amiga no Círculo',
    ],
    limits: {
      circleSize: 1,
      lunaAIMessages: 5,
      insightsPerDay: 2,
    },
  },
  plus: {
    id: 'luna_plus_monthly',
    name: 'Luna Plus',
    price: 19.9,
    period: 'mês',
    revenuecatId: 'luna_plus_monthly',
    features: [
      'Tudo do Free',
      'Luna IA ilimitada',
      'Círculo ilimitado (até 20 amigas)',
      'Modo Parceiro completo',
      'Relatório PDF para ginecologista',
      'Análise por fase (produtividade)',
      'Metas dinâmicas por fase',
      'Artigos e conteúdo exclusivo',
      'Suporte prioritário',
    ],
    limits: null,
  },
  familia: {
    id: 'luna_familia_yearly',
    name: 'Luna Família',
    price: 9.9,
    period: 'pessoa/ano',
    revenuecatId: 'luna_familia_yearly',
    features: [
      'Tudo do Luna Plus',
      'Até 6 membros',
      'Compartilhamento em família',
    ],
    limits: null,
  },
};
