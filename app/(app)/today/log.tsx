import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Chip } from '../../../components/ui/Chip';
import { Button } from '../../../components/ui/Button';
import { SYMPTOMS } from '../../../constants/symptoms';
import { MOODS } from '../../../constants/moods';
import { PHASE_META } from '../../../constants/phases';
import { useUserStore } from '../../../store/useUserStore';
import { useCycleStore } from '../../../store/useCycleStore';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Spacing } from '../../../theme/spacing';
import { Radius } from '../../../theme/radius';
import type { FlowIntensity } from '../../../types/cycle';

const FLOW_OPTIONS: { id: FlowIntensity; label: string; emoji: string }[] = [
  { id: 'light', label: 'Leve', emoji: '🩸' },
  { id: 'medium', label: 'Médio', emoji: '🩸🩸' },
  { id: 'heavy', label: 'Intenso', emoji: '🩸🩸🩸' },
  { id: 'clots', label: 'Coágulos', emoji: '⚠️' },
];

const QUICK_SYMPTOM_IDS = ['cramps', 'headache', 'fatigue', 'bloating'];

type SectionId = 'flow' | 'symptoms' | 'moods' | 'water' | 'weight' | 'notes';

export default function LogScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const { currentPhase, dayOfCycle, todayLog, setTodayLog } = useCycleStore();
  const phaseMeta = PHASE_META[currentPhase];

  // Pre-fill from existing todayLog
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    todayLog?.symptoms ?? []
  );
  const [selectedMoods, setSelectedMoods] = useState<string[]>(
    todayLog?.moods ?? []
  );
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity | null>(
    todayLog?.flowIntensity ?? null
  );
  const [waterMl, setWaterMl] = useState(
    todayLog?.waterMl != null ? String(todayLog.waterMl) : ''
  );
  const [weightKg, setWeightKg] = useState(
    todayLog?.weightKg != null ? String(todayLog.weightKg) : ''
  );
  const [notes, setNotes] = useState(todayLog?.notes ?? '');
  const [loading, setLoading] = useState(false);

  // Post-save animation state
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'done'>('idle');
  const blobScale = useSharedValue(1);
  const blobOpacity = useSharedValue(0);

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(['symptoms', 'moods'])
  );

  const scrollRef = useRef<ScrollView>(null);

  function toggleSection(id: SectionId) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleItem(id: string, list: string[], setList: (v: string[]) => void) {
    if (list.includes(id)) {
      setList(list.filter((item) => item !== id));
    } else {
      setList([...list, id]);
    }
  }

  const handleSave = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    setSaveState('saving');

    // Blob pulse animation
    blobOpacity.value = withTiming(1, { duration: 300 });
    blobScale.value = withSequence(
      withTiming(1.1, { duration: 400, easing: Easing.out(Easing.ease) }),
      withTiming(0.95, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );

    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      const logData = {
        user_id: profile.id,
        log_date: today,
        phase: currentPhase,
        symptoms: selectedSymptoms,
        moods: selectedMoods,
        flow_intensity: flowIntensity,
        water_ml: waterMl ? parseInt(waterMl, 10) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        notes: notes || null,
      };

      const { data, error } = await supabase
        .from('daily_logs')
        .upsert(logData, { onConflict: 'user_id,log_date' })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTodayLog({
          id: data.id,
          userId: data.user_id,
          logDate: data.log_date,
          phase: data.phase,
          symptoms: data.symptoms ?? [],
          moods: data.moods ?? [],
          flowIntensity: data.flow_intensity,
          waterMl: data.water_ml,
          weightKg: data.weight_kg,
          sleepHours: data.sleep_hours,
          steps: data.steps,
          basalTemp: data.basal_temp,
          notes: data.notes,
          sexualActivity: data.sexual_activity ?? false,
          createdAt: data.created_at,
        });
      }

      setSaveState('done');

      // Wait for animation, then dismiss
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch {
      setSaveState('idle');
      blobOpacity.value = withTiming(0, { duration: 300 });
      Alert.alert('Erro', 'Não foi possível salvar o registro.');
    } finally {
      setLoading(false);
    }
  }, [
    profile?.id,
    currentPhase,
    selectedSymptoms,
    selectedMoods,
    flowIntensity,
    waterMl,
    weightKg,
    notes,
    blobOpacity,
    blobScale,
    router,
    setTodayLog,
  ]);

  const blobAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: blobScale.value }],
    opacity: blobOpacity.value,
  }));

  const allSymptoms = currentPhase === 'menstrual'
    ? [...SYMPTOMS.menstrual_only, ...SYMPTOMS.always]
    : SYMPTOMS.always;

  const quickChips = SYMPTOMS.always.filter((s) =>
    QUICK_SYMPTOM_IDS.includes(s.id)
  );

  const totalItems =
    selectedSymptoms.length +
    selectedMoods.length +
    (flowIntensity ? 1 : 0) +
    (waterMl ? 1 : 0) +
    (weightKg ? 1 : 0) +
    (notes ? 1 : 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.backBtn}>✕</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
            </Text>
            <Text style={styles.headerSub}>
              Dia {dayOfCycle} do ciclo · {phaseMeta.emoji} {phaseMeta.label}
            </Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Post-save animation overlay */}
          {saveState !== 'idle' && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              style={styles.savingOverlay}
            >
              <Animated.View style={[styles.savingBlob, blobAnimStyle]}>
                <View
                  style={[
                    styles.savingBlobInner,
                    { backgroundColor: phaseMeta.color },
                  ]}
                />
              </Animated.View>
              <Text style={styles.savingText}>
                {saveState === 'saving'
                  ? 'Atualizando previsões...'
                  : '✓ Previsões atualizadas!'}
              </Text>
            </Animated.View>
          )}

          {/* Quick chips */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Registro rápido</Text>
            <View style={styles.quickRow}>
              {quickChips.map((s) => (
                <Chip
                  key={s.id}
                  label={s.label}
                  emoji={s.emoji}
                  selected={selectedSymptoms.includes(s.id)}
                  onPress={() =>
                    toggleItem(s.id, selectedSymptoms, setSelectedSymptoms)
                  }
                />
              ))}
            </View>
          </View>

          {/* Flow intensity - only in menstrual phase */}
          {currentPhase === 'menstrual' && (
            <View style={styles.section}>
              <Pressable
                style={styles.sectionHeader}
                onPress={() => toggleSection('flow')}
              >
                <Text style={styles.sectionTitle}>🩸 Fluxo</Text>
                {flowIntensity && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>1</Text>
                  </View>
                )}
                <Text style={styles.chevron}>
                  {expandedSections.has('flow') ? '▾' : '▸'}
                </Text>
              </Pressable>
              {expandedSections.has('flow') && (
                <View style={styles.chipGrid}>
                  {FLOW_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.id}
                      label={opt.label}
                      emoji={opt.emoji}
                      selected={flowIntensity === opt.id}
                      onPress={() =>
                        setFlowIntensity(
                          flowIntensity === opt.id ? null : opt.id
                        )
                      }
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Symptoms */}
          <View style={styles.section}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('symptoms')}
            >
              <Text style={styles.sectionTitle}>😣 Sintomas</Text>
              {selectedSymptoms.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {selectedSymptoms.length}
                  </Text>
                </View>
              )}
              <Text style={styles.chevron}>
                {expandedSections.has('symptoms') ? '▾' : '▸'}
              </Text>
            </Pressable>
            {expandedSections.has('symptoms') && (
              <View style={styles.chipGrid}>
                {allSymptoms
                  .filter((s) => !QUICK_SYMPTOM_IDS.includes(s.id))
                  .map((symptom) => (
                    <Chip
                      key={symptom.id}
                      label={symptom.label}
                      emoji={symptom.emoji}
                      selected={selectedSymptoms.includes(symptom.id)}
                      onPress={() =>
                        toggleItem(
                          symptom.id,
                          selectedSymptoms,
                          setSelectedSymptoms
                        )
                      }
                    />
                  ))}
              </View>
            )}
          </View>

          {/* Moods */}
          <View style={styles.section}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('moods')}
            >
              <Text style={styles.sectionTitle}>😊 Humor</Text>
              {selectedMoods.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{selectedMoods.length}</Text>
                </View>
              )}
              <Text style={styles.chevron}>
                {expandedSections.has('moods') ? '▾' : '▸'}
              </Text>
            </Pressable>
            {expandedSections.has('moods') && (
              <View style={styles.chipGrid}>
                {MOODS.map((mood) => (
                  <Chip
                    key={mood.id}
                    label={mood.label}
                    emoji={mood.emoji}
                    selected={selectedMoods.includes(mood.id)}
                    onPress={() =>
                      toggleItem(mood.id, selectedMoods, setSelectedMoods)
                    }
                  />
                ))}
              </View>
            )}
          </View>

          {/* Water */}
          <View style={styles.section}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('water')}
            >
              <Text style={styles.sectionTitle}>💧 Água</Text>
              {waterMl !== '' && (
                <Text style={styles.inlineValue}>{waterMl} ml</Text>
              )}
              <Text style={styles.chevron}>
                {expandedSections.has('water') ? '▾' : '▸'}
              </Text>
            </Pressable>
            {expandedSections.has('water') && (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.numericInput}
                  value={waterMl}
                  onChangeText={setWaterMl}
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <Text style={styles.unit}>ml</Text>
                <View style={styles.quickAmounts}>
                  {[250, 500, 750].map((amount) => (
                    <Pressable
                      key={amount}
                      style={styles.quickAmountBtn}
                      onPress={() => setWaterMl(String(amount))}
                    >
                      <Text style={styles.quickAmountText}>{amount}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Weight */}
          <View style={styles.section}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('weight')}
            >
              <Text style={styles.sectionTitle}>⚖️ Peso</Text>
              {weightKg !== '' && (
                <Text style={styles.inlineValue}>{weightKg} kg</Text>
              )}
              <Text style={styles.chevron}>
                {expandedSections.has('weight') ? '▾' : '▸'}
              </Text>
            </Pressable>
            {expandedSections.has('weight') && (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.numericInput}
                  value={weightKg}
                  onChangeText={setWeightKg}
                  placeholder="0.0"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                  maxLength={6}
                />
                <Text style={styles.unit}>kg</Text>
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('notes')}
            >
              <Text style={styles.sectionTitle}>📝 Anotações</Text>
              {notes.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>✓</Text>
                </View>
              )}
              <Text style={styles.chevron}>
                {expandedSections.has('notes') ? '▾' : '▸'}
              </Text>
            </Pressable>
            {expandedSections.has('notes') && (
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Como você está se sentindo hoje?"
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Fixed footer */}
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerCount}>
              {totalItems} {totalItems === 1 ? 'item registrado' : 'itens registrados'}
            </Text>
          </View>
          <Pressable
            style={[
              styles.applyBtn,
              { backgroundColor: phaseMeta.color },
              loading && styles.applyBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={loading || saveState !== 'idle'}
          >
            <Text style={styles.applyBtnText}>
              {loading ? 'Salvando...' : 'Aplicar'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blush,
  },
  backBtn: {
    fontSize: 20,
    color: Colors.textLight,
    width: 32,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  headerSub: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  // Saving overlay
  savingOverlay: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  savingBlob: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  savingBlobInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.4,
  },
  savingText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  // Quick chips
  section: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  sectionLabel: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  // Collapsible sections
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    flex: 1,
  },
  chevron: {
    fontSize: 16,
    color: Colors.textLight,
    marginLeft: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.rose,
    borderRadius: Radius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
  },
  inlineValue: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.rose,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  // Numeric inputs
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  numericInput: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minWidth: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.blush,
  },
  unit: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.md,
    color: Colors.textLight,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  quickAmountBtn: {
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.blush,
  },
  quickAmountText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  // Notes
  notesInput: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.blush,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.blush,
    backgroundColor: Colors.cream,
  },
  footerInfo: {
    flex: 1,
  },
  footerCount: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
  applyBtn: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
  },
  applyBtnDisabled: {
    opacity: 0.6,
  },
  applyBtnText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.base,
    color: Colors.white,
    textAlign: 'center',
  },
});
