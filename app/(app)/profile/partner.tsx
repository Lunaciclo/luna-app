import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useCurrentPhase } from '../../../hooks/useCurrentPhase';
import { PARTNER_TIPS } from '../../../constants/content';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Spacing } from '../../../theme/spacing';
import { Radius } from '../../../theme/radius';
import { supabase } from '../../../lib/supabase';
import { useUserStore } from '../../../store/useUserStore';
import { useCycleStore } from '../../../store/useCycleStore';

function generateLinkCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function PartnerScreen() {
  const router = useRouter();
  const { phase, meta } = useCurrentPhase();
  const { profile } = useUserStore();
  const { todayLog } = useCycleStore();
  const partnerTip = PARTNER_TIPS[phase];

  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharePhase, setSharePhase] = useState(true);
  const [shareSymptoms, setShareSymptoms] = useState(true);
  const [shareFertility, setShareFertility] = useState(true);

  const fetchOrCreateConnection = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      // Check for existing active connection
      const { data: existing, error: fetchError } = await supabase
        .from('partner_connections')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching partner connection:', fetchError);
        setLoading(false);
        return;
      }

      if (existing) {
        setLinkCode(existing.link_code);
        setSharePhase(existing.share_phase ?? true);
        setShareSymptoms(existing.share_symptoms ?? true);
        setShareFertility(existing.share_fertility ?? true);
      } else {
        // Generate and save new code
        const code = generateLinkCode();

        const { error: insertError } = await supabase
          .from('partner_connections')
          .insert({
            user_id: profile.id,
            link_code: code,
            is_active: true,
            share_phase: true,
            share_symptoms: true,
            share_fertility: true,
          });

        if (insertError) {
          console.error('Error creating partner connection:', insertError);
          setLoading(false);
          return;
        }

        setLinkCode(code);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchOrCreateConnection();
  }, [fetchOrCreateConnection]);

  async function updateShareSetting(
    field: 'share_phase' | 'share_symptoms' | 'share_fertility',
    value: boolean
  ) {
    if (!profile?.id || !linkCode) return;

    const { error } = await supabase
      .from('partner_connections')
      .update({ [field]: value })
      .eq('user_id', profile.id)
      .eq('link_code', linkCode);

    if (error) {
      console.error(`Error updating ${field}:`, error);
    }
  }

  function handleTogglePhase(value: boolean) {
    setSharePhase(value);
    updateShareSetting('share_phase', value);
  }

  function handleToggleSymptoms(value: boolean) {
    setShareSymptoms(value);
    updateShareSetting('share_symptoms', value);
  }

  function handleToggleFertility(value: boolean) {
    setShareFertility(value);
    updateShareSetting('share_fertility', value);
  }

  async function handleShareLink() {
    if (!linkCode) return;

    try {
      await Share.share({
        message: `Acompanhe meu ciclo pela Luna! Acesse: luna.app/p/${linkCode}`,
        title: 'Luna - Modo Parceiro',
      });
    } catch {
      // User cancelled
    }
  }

  function handleStopSharing() {
    Alert.alert(
      'Parar de compartilhar?',
      'Seu parceiro(a) nao tera mais acesso as informacoes do seu ciclo. Voce pode reativar a qualquer momento.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Parar',
          style: 'destructive',
          onPress: async () => {
            if (!profile?.id || !linkCode) return;

            const { error } = await supabase
              .from('partner_connections')
              .update({ is_active: false })
              .eq('user_id', profile.id)
              .eq('link_code', linkCode);

            if (error) {
              console.error('Error deactivating connection:', error);
              return;
            }

            setLinkCode(null);
            setSharePhase(true);
            setShareSymptoms(true);
            setShareFertility(true);
          },
        },
      ]
    );
  }

  const symptomsToday = todayLog?.symptoms ?? [];
  const phaseColor = meta.color;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.rose} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Button title="← Voltar" onPress={() => router.back()} variant="ghost" />

          <Text style={styles.title}>Modo Parceiro</Text>
          <Text style={styles.subtitle}>
            Compartilhe informacoes do seu ciclo com quem voce confia.
            Inclusivo e sem precisar baixar outro app.
          </Text>

          {/* Link Code Display */}
          {linkCode && (
            <Card style={styles.codeCard}>
              <Text style={styles.codeLabel}>Seu codigo de compartilhamento</Text>
              <View style={styles.codeDisplay}>
                {linkCode.split('').map((char, i) => (
                  <View key={i} style={styles.codeCharBox}>
                    <Text style={styles.codeChar}>{char}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.codeHint}>
                Compartilhe este codigo com seu parceiro(a)
              </Text>
            </Card>
          )}

          {/* Share Button */}
          <Button
            title="Compartilhar link com parceiro(a)"
            onPress={handleShareLink}
            variant="pill"
            fullWidth
            disabled={!linkCode}
          />

          {/* Partner View Section */}
          <Text style={styles.sectionTitle}>O que seu parceiro(a) ve</Text>

          {/* Current Phase */}
          <Card style={styles.phaseCard}>
            <View style={[styles.phaseBadge, { backgroundColor: phaseColor + '20' }]}>
              <Text style={styles.phaseEmoji}>{meta.emoji}</Text>
              <Text style={[styles.phaseLabel, { color: phaseColor }]}>{meta.label}</Text>
            </View>
          </Card>

          {/* Today's Symptoms */}
          {shareSymptoms && symptomsToday.length > 0 && (
            <Card style={styles.symptomsCard}>
              <Text style={styles.cardTitle}>Sintomas de hoje</Text>
              <View style={styles.symptomsList}>
                {symptomsToday.map((symptom, i) => (
                  <View key={i} style={styles.symptomChip}>
                    <Text style={styles.symptomText}>{symptom}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {shareSymptoms && symptomsToday.length === 0 && (
            <Card style={styles.symptomsCard}>
              <Text style={styles.cardTitle}>Sintomas de hoje</Text>
              <Text style={styles.noSymptomsText}>Nenhum sintoma registrado hoje</Text>
            </Card>
          )}

          {/* How to Support Today */}
          <Card style={styles.supportCard}>
            <Text style={styles.cardTitle}>Como apoiar hoje</Text>
            <Text style={styles.tipText}>{partnerTip.tip}</Text>
            <View style={styles.activities}>
              {partnerTip.activities.map((activity, i) => (
                <View key={i} style={styles.activityRow}>
                  <View style={styles.activityDot} />
                  <Text style={styles.activity}>{activity}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Toggle Controls */}
          <Text style={styles.sectionTitle}>O que compartilhar</Text>

          <Card>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Fase do ciclo</Text>
                <Text style={styles.settingDescription}>Mostra a fase atual do seu ciclo</Text>
              </View>
              <Switch
                value={sharePhase}
                onValueChange={handleTogglePhase}
                trackColor={{ false: '#E0D5DB', true: Colors.rose + '60' }}
                thumbColor={sharePhase ? Colors.rose : '#F4F0F2'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sintomas</Text>
                <Text style={styles.settingDescription}>Compartilha seus sintomas do dia</Text>
              </View>
              <Switch
                value={shareSymptoms}
                onValueChange={handleToggleSymptoms}
                trackColor={{ false: '#E0D5DB', true: Colors.rose + '60' }}
                thumbColor={shareSymptoms ? Colors.rose : '#F4F0F2'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Janela fertil</Text>
                <Text style={styles.settingDescription}>Mostra sua janela de fertilidade</Text>
              </View>
              <Switch
                value={shareFertility}
                onValueChange={handleToggleFertility}
                trackColor={{ false: '#E0D5DB', true: Colors.rose + '60' }}
                thumbColor={shareFertility ? Colors.rose : '#F4F0F2'}
              />
            </View>
          </Card>

          {/* Stop Sharing */}
          {linkCode && (
            <Button
              title="Parar de compartilhar"
              onPress={handleStopSharing}
              variant="ghost"
              fullWidth
              textStyle={styles.stopSharingText}
            />
          )}

          <View style={styles.bottomSpacer} />
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: Spacing.base,
    gap: Spacing.lg,
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
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  sectionTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text,
    marginTop: Spacing.sm,
  },

  // Code display
  codeCard: {
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.blush,
  },
  codeLabel: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeDisplay: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  codeCharBox: {
    width: 44,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeChar: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    color: Colors.rose,
  },
  codeHint: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },

  // Phase badge
  phaseCard: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  phaseEmoji: {
    fontSize: 24,
  },
  phaseLabel: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
  },

  // Symptoms
  symptomsCard: {
    gap: Spacing.md,
  },
  cardTitle: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  symptomsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  symptomChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.rose + '30',
  },
  symptomText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  noSymptomsText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
    fontStyle: 'italic',
  },

  // Support card
  supportCard: {
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.blush,
  },
  tipText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  activities: {
    gap: Spacing.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.rose,
  },
  activity: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },

  // Settings toggles
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.base,
  },
  settingLabel: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  settingDescription: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.blush,
  },

  // Stop sharing
  stopSharingText: {
    color: Colors.textLight,
    fontSize: Typography.sizes.sm,
  },

  bottomSpacer: {
    height: Spacing['2xl'],
  },
});
