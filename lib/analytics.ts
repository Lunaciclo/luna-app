type EventName =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_step'
  | 'period_logged'
  | 'symptom_logged'
  | 'mood_logged'
  | 'paywall_shown'
  | 'paywall_purchased'
  | 'paywall_skipped'
  | 'luna_ai_message'
  | 'circle_invite_sent'
  | 'partner_link_created';

interface EventProperties {
  [key: string]: string | number | boolean;
}

export function trackEvent(name: EventName, properties?: EventProperties): void {
  // TODO: Integrate with analytics provider (Mixpanel, Amplitude, etc.)
  if (__DEV__) {
    console.log(`[Analytics] ${name}`, properties);
  }
}
