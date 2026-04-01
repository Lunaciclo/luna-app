import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

const OBJECTIVES = [
  { id: 'predict_period', label: 'Prever menstruação', emoji: '📅' },
  { id: 'track_symptoms', label: 'Rastrear sintomas', emoji: '📋' },
  { id: 'understand_phases', label: 'Entender fases', emoji: '🔄' },
  { id: 'improve_skin', label: 'Melhorar pele', emoji: '✨' },
  { id: 'manage_pms', label: 'Controlar TPM', emoji: '🌧️' },
  { id: 'optimize_workout', label: 'Otimizar treinos', emoji: '💪' },
  { id: 'track_mood', label: 'Rastrear humor', emoji: '😊' },
  { id: 'fertility', label: 'Fertilidade', emoji: '🌸' },
  { id: 'sleep_better', label: 'Dormir melhor', emoji: '😴' },
  { id: 'nutrition', label: 'Nutrição por fase', emoji: '🥗' },
];

export default function ObjectivesGridScreen() {
  const router = useRouter();
  const { objectives, setObjectives } = useOnboardingStore();

  function toggleObjective(id: string) {
    if (objectives.includes(id)) {
      setObjectives(objectives.filter((o) => o !== id));
    } else {
      setObjectives([...objectives, id]);
    }
  }

  return (
    <OnboardingLayout
      step={7}
      title="O que te interessa?"
      subtitle="Selecione tudo que se aplica. Isso personaliza seu conteúdo."
      onNext={() => router.push('/(onboarding)/app-preview')}
      nextDisabled={objectives.length === 0}
    >
      <View style={styles.grid}>
        {OBJECTIVES.map((obj) => {
          const isSelected = objectives.includes(obj.id);
          return (
            <Pressable
              key={obj.id}
              style={[
                styles.card,
                isSelected ? styles.cardSelected : styles.cardUnselected,
              ]}
              onPress={() => toggleObjective(obj.id)}
            >
              <Text style={styles.cardEmoji}>{obj.emoji}</Text>
              <Text
                style={[
                  styles.cardLabel,
                  isSelected ? styles.cardLabelSelected : styles.cardLabelUnselected,
                ]}
                numberOfLines={2}
              >
                {obj.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const GAP = Spacing.md;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    marginTop: Spacing.lg,
  },
  card: {
    width: '48%',
    aspectRatio: 1.15,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.base,
    borderWidth: 1.5,
  },
  cardUnselected: {
    backgroundColor: Colors.white,
    borderColor: Colors.blush,
  },
  cardSelected: {
    backgroundColor: Colors.rose,
    borderColor: Colors.rose,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  cardLabel: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
  cardLabelUnselected: {
    color: Colors.text,
  },
  cardLabelSelected: {
    color: Colors.white,
  },
});
