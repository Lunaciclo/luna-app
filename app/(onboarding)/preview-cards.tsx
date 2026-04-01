import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { DailyInsightCard } from '../../components/cycle/DailyInsightCard';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { getCurrentPhase } from '../../lib/cycle';
import { PHASE_CONTENT } from '../../constants/content';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { Colors } from '../../theme/colors';

export default function PreviewCardsScreen() {
  const router = useRouter();
  const { lastPeriodDate, cycleLength, flowLength } = useOnboardingStore();

  const cycleData = {
    lastPeriodStart: lastPeriodDate ?? new Date(),
    cycleLength,
    flowLength,
  };
  const phase = getCurrentPhase(cycleData);
  const content = PHASE_CONTENT[phase];

  return (
    <OnboardingLayout
      step={19}
      title="Seus insights personalizados"
      subtitle="Receba dicas diárias baseadas na sua fase atual."
      onNext={() => router.push('/(onboarding)/social-proof')}
    >
      <Text style={styles.sectionTitle}>{content.editorialTitle}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.cards}>
          {content.insights.map((insight, i) => (
            <DailyInsightCard
              key={i}
              tag={insight.tag}
              title={insight.title}
              icon={insight.icon}
            />
          ))}
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  cards: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
});
