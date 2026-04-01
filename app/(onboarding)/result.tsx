import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { getCurrentPhase, getDayOfCycle, getDaysUntilNextPeriod } from '../../lib/cycle';
import { PHASE_META } from '../../constants/phases';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

function CheckIcon() {
  return <Text style={styles.badgeIcon}>✓</Text>;
}

function WarningIcon() {
  return <Text style={styles.badgeIcon}>⚠</Text>;
}

type AnalysisBadgeProps = {
  label: string;
  status: 'NORMAL' | 'IRREGULAR' | 'ATENCAO';
  explanation: string;
};

function AnalysisBadge({ label, status, explanation }: AnalysisBadgeProps) {
  const isNormal = status === 'NORMAL';
  const pillColor = isNormal ? Colors.green : Colors.coral;
  const statusText = status === 'ATENCAO' ? 'ATENÇÃO' : status;

  return (
    <View style={styles.analysisBadge}>
      <View style={styles.badgeRow}>
        <Text style={styles.badgeLabel}>{label}</Text>
        <View style={[styles.statusPill, { backgroundColor: pillColor }]}>
          {isNormal ? <CheckIcon /> : <WarningIcon />}
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>
      <Text style={styles.badgeExplanation}>{explanation}</Text>
    </View>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const { lastPeriodDate, cycleLength, flowLength, name } = useOnboardingStore();

  const cycleData = {
    lastPeriodStart: lastPeriodDate ?? new Date(),
    cycleLength,
    flowLength,
  };

  const phase = getCurrentPhase(cycleData);
  const day = getDayOfCycle(cycleData.lastPeriodStart);
  const daysUntil = getDaysUntilNextPeriod(cycleData);
  const meta = PHASE_META[phase];

  const isCycleNormal = cycleLength >= 21 && cycleLength <= 35;
  const isFlowNormal = flowLength >= 3 && flowLength <= 7;

  return (
    <OnboardingLayout
      step={18}
      onNext={() => router.push('/(onboarding)/preview-cards')}
      nextLabel="Continuar"
    >
      <View style={styles.content}>
        <Text style={styles.greeting}>
          {name ? `${name}, ` : ''}aqui está sua previsão
        </Text>

        <View style={[styles.phaseCard, { backgroundColor: meta.color + '15' }]}>
          <Text style={styles.phaseEmoji}>{meta.emoji}</Text>
          <Text style={[styles.phaseName, { color: meta.color }]}>
            {meta.label}
          </Text>
          <Text style={styles.phaseDay}>Dia {day} do ciclo</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{daysUntil}</Text>
            <Text style={styles.statLabel}>dias para a próxima menstruação</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{cycleLength}</Text>
            <Text style={styles.statLabel}>dias de ciclo</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{flowLength}</Text>
            <Text style={styles.statLabel}>dias de fluxo</Text>
          </View>
        </View>

        <View style={styles.analysisSection}>
          <AnalysisBadge
            label="Duração do ciclo"
            status={isCycleNormal ? 'NORMAL' : 'IRREGULAR'}
            explanation={
              isCycleNormal
                ? `Seu ciclo de ${cycleLength} dias está dentro da faixa saudável (21-35 dias).`
                : `Seu ciclo de ${cycleLength} dias está fora da faixa típica (21-35 dias). Considere consultar um profissional.`
            }
          />
          <AnalysisBadge
            label="Duração do fluxo"
            status={isFlowNormal ? 'NORMAL' : 'ATENCAO'}
            explanation={
              isFlowNormal
                ? `Seu fluxo de ${flowLength} dias está dentro da faixa saudável (3-7 dias).`
                : `Seu fluxo de ${flowLength} dias está fora da faixa típica (3-7 dias). Considere consultar um profissional.`
            }
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
  },
  greeting: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  phaseCard: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    borderRadius: Radius.xl,
    width: '100%',
    marginBottom: Spacing['2xl'],
  },
  phaseEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  phaseName: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    marginBottom: Spacing.xs,
  },
  phaseDay: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Spacing['2xl'],
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.rose,
  },
  statLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  analysisSection: {
    width: '100%',
    gap: Spacing.base,
  },
  analysisBadge: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.blush,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  badgeLabel: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  badgeIcon: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },
  statusText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  badgeExplanation: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
});
