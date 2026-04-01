import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { PhaseIndicator } from '../../../components/cycle/PhaseIndicator';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Spacing } from '../../../theme/spacing';
import { Radius } from '../../../theme/radius';
import { PHASE_META } from '../../../constants/phases';
import { Phase } from '../../../types/cycle';

// ---------------------------------------------------------------------------
// Support tips per phase
// ---------------------------------------------------------------------------
const SUPPORT_TIPS: Record<Phase, string> = {
  menstrual: 'Ela pode precisar de descanso 💆‍♀️',
  follicular: 'Cheia de energia! Bora treinar juntas? 💪',
  ovulatory: 'No auge da energia! Hora de socializar ✨',
  luteal: 'Pode estar mais sensível. Mande carinho 🤗',
};

// ---------------------------------------------------------------------------
// Reaction definitions
// ---------------------------------------------------------------------------
const REACTIONS = [
  { emoji: '🤗', label: 'apoio' },
  { emoji: '❤️', label: 'amor' },
  { emoji: '💪', label: 'força' },
] as const;

// ---------------------------------------------------------------------------
// Mock data for circle members
// ---------------------------------------------------------------------------
const MOCK_FRIENDS = [
  { id: '1', name: 'Ana', phase: 'ovulatory' as Phase, dayOfCycle: 14, totalPhaseDays: 4 },
  { id: '2', name: 'Maria', phase: 'menstrual' as Phase, dayOfCycle: 3, totalPhaseDays: 5 },
  { id: '3', name: 'Juliana', phase: 'luteal' as Phase, dayOfCycle: 22, totalPhaseDays: 12 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function timeAgo(minutes: number): string {
  if (minutes < 1) return 'Atualizado agora';
  if (minutes < 60) return `Atualizado há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `Atualizado há ${hours}h`;
}

/** Returns a value between 0 and 1 representing phase progress. */
function phaseProgress(dayInPhase: number, totalPhaseDays: number): number {
  if (totalPhaseDays <= 0) return 0;
  return Math.min(dayInPhase / totalPhaseDays, 1);
}

// ---------------------------------------------------------------------------
// Reaction Button (with animated feedback)
// ---------------------------------------------------------------------------
interface ReactionButtonProps {
  emoji: string;
  label: string;
  onReact: (label: string) => void;
}

function ReactionButton({ emoji, label, onReact }: ReactionButtonProps) {
  const scale = useSharedValue(1);
  const floatY = useSharedValue(0);
  const floatOpacity = useSharedValue(0);

  const animatedButton = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedFloat = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
    opacity: floatOpacity.value,
  }));

  const handlePress = useCallback(() => {
    // Button bounce
    scale.value = withSequence(
      withTiming(1.4, { duration: 120, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 6, stiffness: 200 }),
    );

    // Floating emoji feedback
    floatY.value = 0;
    floatOpacity.value = 1;
    floatY.value = withTiming(-36, { duration: 600, easing: Easing.out(Easing.quad) });
    floatOpacity.value = withDelay(300, withTiming(0, { duration: 300 }));

    onReact(label);
  }, [label, onReact, scale, floatY, floatOpacity]);

  return (
    <View style={styles.reactionWrapper}>
      <Animated.View style={[styles.reactionFloat, animatedFloat]}>
        <Text style={styles.reactionFloatText}>{emoji}</Text>
      </Animated.View>
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.reactionButton, animatedButton]}>
          <Text style={styles.reactionEmoji}>{emoji}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Phase Progress Bar
// ---------------------------------------------------------------------------
interface PhaseProgressBarProps {
  progress: number;
  color: string;
}

function PhaseProgressBar({ progress, color }: PhaseProgressBarProps) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${Math.round(progress * 100)}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Friend Card
// ---------------------------------------------------------------------------
interface FriendCardProps {
  friend: (typeof MOCK_FRIENDS)[number];
  onPress: () => void;
}

function FriendCard({ friend, onPress }: FriendCardProps) {
  const meta = PHASE_META[friend.phase];
  const tip = SUPPORT_TIPS[friend.phase];
  const progress = phaseProgress(friend.dayOfCycle, friend.totalPhaseDays);

  const handleReaction = useCallback(
    (label: string) => {
      // In a real app this would send the reaction to the backend
    },
    [friend.id],
  );

  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.friendCardInner}>
          {/* Top row: avatar + info */}
          <View style={styles.friendTopRow}>
            <Avatar name={friend.name} size={48} phaseColor={meta.color} />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <View style={styles.friendPhaseRow}>
                <PhaseIndicator phase={friend.phase} size="small" />
                <Text style={styles.friendDay}>Dia {friend.dayOfCycle}</Text>
              </View>
            </View>
          </View>

          {/* Phase progress bar */}
          <View style={styles.progressSection}>
            <PhaseProgressBar progress={progress} color={meta.color} />
            <Text style={styles.progressLabel}>
              {meta.label} — {Math.round(progress * 100)}%
            </Text>
          </View>

          {/* Support tip */}
          <View style={[styles.tipContainer, { backgroundColor: meta.color + '18' }]}>
            <Text style={styles.tipText}>{tip}</Text>
          </View>

          {/* Reaction buttons */}
          <View style={styles.reactionsRow}>
            {REACTIONS.map((r) => (
              <ReactionButton
                key={r.label}
                emoji={r.emoji}
                label={r.label}
                onReact={handleReaction}
              />
            ))}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <View style={styles.emptyState}>
      {/* Illustration-like emoji composition */}
      <View style={styles.emptyIllustration}>
        <Text style={styles.emptyEmojiLarge}>🌙</Text>
        <View style={styles.emptyEmojiRow}>
          <Text style={styles.emptyEmojiMedium}>👩</Text>
          <Text style={styles.emptyEmojiHeart}>💕</Text>
          <Text style={styles.emptyEmojiMedium}>👩</Text>
        </View>
        <View style={styles.emptyEmojiStars}>
          <Text style={styles.emptyEmojiSmall}>✨</Text>
          <Text style={styles.emptyEmojiSmall}>🌸</Text>
          <Text style={styles.emptyEmojiSmall}>✨</Text>
        </View>
      </View>

      <Text style={styles.emptyTitle}>Crie seu Círculo de Amigas</Text>
      <Text style={styles.emptySubtitle}>
        Acompanhe o ciclo das suas amigas, ofereça apoio no momento certo e
        fortaleça a conexão entre vocês. Juntas, tudo fica mais leve.
      </Text>

      <View style={styles.emptyBenefits}>
        <Text style={styles.emptyBenefit}>🔄  Saiba a fase de cada amiga em tempo real</Text>
        <Text style={styles.emptyBenefit}>💬  Envie apoio quando ela mais precisa</Text>
        <Text style={styles.emptyBenefit}>🤝  Fortaleça suas amizades com empatia</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------
export default function CircleScreen() {
  const router = useRouter();
  const [lastSyncMinutes] = useState(5); // In production, derive from real sync state

  const friendCount = MOCK_FRIENDS.length;

  const handleInvite = useCallback(async () => {
    try {
      await Share.share(
        {
          message:
            'Junte-se ao meu Círculo de Amigas no Luna! 🌙\n\nhttps://luna.app/invite/abc123',
          title: 'Luna - Círculo de Amigas',
        },
      );
    } catch (_) {
      // User cancelled or share failed — no action required
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Círculo de Amigas{friendCount > 0 ? ` (${friendCount})` : ''}
            </Text>
            <Text style={styles.subtitle}>Acompanhe suas amigas</Text>
          </View>
        </View>

        {/* Sync status */}
        {friendCount > 0 && (
          <View style={styles.syncRow}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>{timeAgo(lastSyncMinutes)}</Text>
          </View>
        )}

        {/* Friend list or empty state */}
        {friendCount > 0 ? (
          <FlatList
            data={MOCK_FRIENDS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FriendCard
                friend={item}
                onPress={() => router.push(`/(app)/circle/${item.id}`)}
              />
            )}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState />
        )}

        {/* Footer with invite button */}
        <View style={styles.footer}>
          <Button
            title="Convidar amiga"
            onPress={handleInvite}
            variant="pill"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // Layout
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.base,
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },

  // Sync status
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.phases.follicular,
  },
  syncText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },

  // List
  list: {
    paddingBottom: Spacing.xl,
  },
  separator: {
    height: Spacing.md,
  },

  // Friend Card
  friendCardInner: {
    gap: Spacing.md,
  },
  friendTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  friendPhaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  friendDay: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },

  // Phase progress bar
  progressSection: {
    gap: Spacing.xs,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.blush,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },

  // Support tip
  tipContainer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  tipText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },

  // Reactions
  reactionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  reactionWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionFloat: {
    position: 'absolute',
    top: -8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  reactionFloatText: {
    fontSize: 22,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  emptyIllustration: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyEmojiLarge: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  emptyEmojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyEmojiMedium: {
    fontSize: 40,
  },
  emptyEmojiHeart: {
    fontSize: 28,
  },
  emptyEmojiStars: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  emptyEmojiSmall: {
    fontSize: 20,
  },
  emptyTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  emptyBenefits: {
    alignSelf: 'stretch',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderRadius: Radius.lg,
  },
  emptyBenefit: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },

  // Footer
  footer: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
});
