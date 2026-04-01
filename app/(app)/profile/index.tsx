import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { PhaseIndicator } from '../../../components/cycle/PhaseIndicator';
import { useUserStore } from '../../../store/useUserStore';
import { useCycleStore } from '../../../store/useCycleStore';
import { useSubscription } from '../../../hooks/useSubscription';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Spacing } from '../../../theme/spacing';
import { Radius } from '../../../theme/radius';
import { Goal } from '../../../types/cycle';
import { PLANS } from '../../../constants/subscription';

const GOAL_LABELS: Record<Goal, string> = {
  track_cycle: 'Acompanhar ciclo',
  get_pregnant: 'Quero engravidar',
  avoid_pregnancy: 'Evitar gravidez',
  health: 'Saude geral',
  menopause: 'Menopausa',
};

const GOAL_COLORS: Record<Goal, string> = {
  track_cycle: Colors.rose,
  get_pregnant: Colors.coral,
  avoid_pregnancy: Colors.plum,
  health: Colors.green,
  menopause: Colors.peach,
};

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, reset: resetUser } = useUserStore();
  const { currentPhase } = useCycleStore();
  const { isPremium, planId, expiresAt, restorePurchases } = useSubscription();
  const [isRestoring, setIsRestoring] = useState(false);

  async function handleLogout() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          resetUser();
          router.replace('/');
        },
      },
    ]);
  }

  function handleLGPD() {
    Alert.alert('Meus dados (LGPD)', 'Escolha uma opcao:', [
      {
        text: 'Exportar meus dados',
        onPress: () =>
          Alert.alert(
            'Exportar dados',
            'Seus dados serao enviados por email em ate 48h.',
          ),
      },
      {
        text: 'Excluir minha conta',
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            'Excluir conta',
            'Tem certeza? Todos os seus dados serao permanentemente excluidos em ate 30 dias.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Sim, excluir',
                style: 'destructive',
                onPress: () => {
                  // TODO: Call account deletion API
                },
              },
            ],
          ),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function handleCycleSettings() {
    Alert.alert('Em breve', 'As configuracoes do ciclo estarao disponiveis em breve.');
  }

  function handleManageSubscription() {
    // TODO: Open RevenueCat management URL or app store subscription management
    Alert.alert('Gerenciar assinatura', 'Voce sera redirecionada para gerenciar sua assinatura.');
  }

  async function handleRestorePurchases() {
    if (isRestoring) return;
    setIsRestoring(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert(
          'Compras restauradas',
          'Sua assinatura foi restaurada com sucesso!',
        );
      } else {
        Alert.alert(
          'Nenhuma compra encontrada',
          'Nao encontramos nenhuma assinatura ativa associada a sua conta.',
        );
      }
    } catch {
      Alert.alert(
        'Erro',
        'Nao foi possivel restaurar suas compras. Tente novamente mais tarde.',
      );
    } finally {
      setIsRestoring(false);
    }
  }

  function getPlanDisplayName(): string {
    if (planId === 'luna_plus_monthly') return PLANS.plus.name;
    if (planId === 'luna_familia_yearly') return PLANS.familia.name;
    return 'Luna Plus';
  }

  function formatExpirationDate(): string | null {
    if (!expiresAt) return null;
    try {
      const date = new Date(expiresAt);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }

  const menuItems = [
    { label: 'Luna IA', emoji: '🌙', route: '/(app)/profile/luna-ai' },
    { label: 'Modo Parceiro', emoji: '💑', route: '/(app)/profile/partner' },
    { label: 'Configuracoes do Ciclo', emoji: '⚙️', route: '__cycle_settings__' },
    { label: 'Notificacoes', emoji: '🔔', route: null },
    { label: 'Privacidade', emoji: '🔒', route: null },
    { label: 'Meus dados (LGPD)', emoji: '📋', route: '__lgpd__' },
    { label: 'Ajuda', emoji: '❓', route: null },
  ];

  function handleMenuPress(item: (typeof menuItems)[number]) {
    if (item.route === '__cycle_settings__') {
      handleCycleSettings();
    } else if (item.route === '__lgpd__') {
      handleLGPD();
    } else if (item.route) {
      router.push(item.route as never);
    }
  }

  const goalKey = profile?.goal;
  const expirationFormatted = formatExpirationDate();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Perfil</Text>

          {/* Profile card */}
          <Card style={styles.profileCard}>
            <Avatar
              name={profile?.name}
              size={64}
              phaseColor={Colors.phases[currentPhase]}
            />
            <Text style={styles.name}>{profile?.name ?? 'Usuaria'}</Text>

            {/* Goal pill */}
            {goalKey && GOAL_LABELS[goalKey] && (
              <View
                style={[
                  styles.goalPill,
                  { backgroundColor: GOAL_COLORS[goalKey] + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.goalPillText,
                    { color: GOAL_COLORS[goalKey] },
                  ]}
                >
                  🎯 {GOAL_LABELS[goalKey]}
                </Text>
              </View>
            )}

            <PhaseIndicator phase={currentPhase} size="medium" />

            {/* Premium section */}
            {isPremium ? (
              <View style={styles.premiumSection}>
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>✨ {getPlanDisplayName()}</Text>
                </View>
                {expirationFormatted && (
                  <Text style={styles.premiumExpiry}>
                    Valido ate {expirationFormatted}
                  </Text>
                )}
                <Pressable
                  onPress={handleManageSubscription}
                  style={styles.manageSubscription}
                >
                  <Text style={styles.manageSubscriptionText}>
                    Gerenciar assinatura
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Button
                title="Assinar Luna Plus"
                onPress={() => router.push('/(onboarding)/paywall')}
                variant="pill"
                style={{ marginTop: Spacing.md }}
              />
            )}
          </Card>

          {/* Menu */}
          <View style={styles.menu}>
            {menuItems.map((item, i) => (
              <Pressable
                key={i}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item)}
              >
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </Pressable>
            ))}
          </View>

          {/* Restore purchases */}
          <Pressable
            onPress={handleRestorePurchases}
            style={styles.restoreButton}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color={Colors.rose} />
            ) : (
              <Text style={styles.restoreText}>Restaurar compras</Text>
            )}
          </Pressable>

          {/* Logout */}
          <Button
            title="Sair da conta"
            onPress={handleLogout}
            variant="ghost"
            fullWidth
          />

          {/* App version */}
          <Text style={styles.versionText}>Luna v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    padding: Spacing.base,
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },
  name: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  goalPill: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  goalPillText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
  },
  premiumSection: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  premiumBadge: {
    backgroundColor: Colors.plum,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  premiumText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },
  premiumExpiry: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
  manageSubscription: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  manageSubscriptionText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.rose,
    textDecorationLine: 'underline',
  },
  menu: {
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
  },
  menuEmoji: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  menuLabel: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    flex: 1,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.textLight,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  restoreText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.rose,
    textDecorationLine: 'underline',
  },
  versionText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.base,
  },
});
