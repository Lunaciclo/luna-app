import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar } from '../../../components/ui/Avatar';
import { PhaseIndicator } from '../../../components/cycle/PhaseIndicator';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Spacing } from '../../../theme/spacing';
import { PHASE_META } from '../../../constants/phases';
import { Phase } from '../../../types/cycle';

export default function FriendProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // TODO: Fetch friend data from Supabase
  const friend = { name: 'Ana', phase: 'ovulatory' as Phase, dayOfCycle: 14 };
  const meta = PHASE_META[friend.phase];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Button title="← Voltar" onPress={() => router.back()} variant="ghost" />

        <View style={styles.profile}>
          <Avatar name={friend.name} size={80} phaseColor={meta.color} />
          <Text style={styles.name}>{friend.name}</Text>
          <PhaseIndicator phase={friend.phase} size="medium" />
          <Text style={styles.day}>Dia {friend.dayOfCycle} do ciclo</Text>
        </View>

        <Card>
          <Text style={styles.tipTitle}>Como apoiar {friend.name} hoje</Text>
          <Text style={styles.tipText}>
            {friend.name} está na fase {meta.label.toLowerCase()}.{' '}
            {meta.mood} é o humor esperado.
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button
            title="🤗 Enviar abraço"
            onPress={() => {/* TODO */}}
            variant="secondary"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    flex: 1,
    padding: Spacing.base,
  },
  profile: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.md,
  },
  name: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.text,
  },
  day: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
  },
  tipTitle: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  actions: {
    marginTop: Spacing.xl,
  },
});
