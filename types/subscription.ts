export type PlanId = 'free' | 'luna_plus_monthly' | 'luna_familia_yearly';

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  period?: string;
  revenuecatId?: string;
  features: string[];
  limits: {
    circleSize: number;
    lunaAIMessages: number;
    insightsPerDay: number;
  } | null;
}

export interface SubscriptionState {
  isActive: boolean;
  planId: PlanId;
  expiresAt: string | null;
}
