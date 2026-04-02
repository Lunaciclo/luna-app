import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { OnboardingLayout } from "../../components/onboarding/OnboardingLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { supabase } from "../../lib/supabase";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { useUserStore } from "../../store/useUserStore";
import { Colors } from "../../theme/colors";
import { Spacing } from "../../theme/spacing";
import { Typography } from "../../theme/typography";

export default function CreateAccountScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const onboarding = useOnboardingStore();
  const { setAuthenticated, setOnboardingComplete } = useUserStore();

  async function handleCreateAccount() {
    if (!email || !password) return;
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        await supabase.from("profiles").insert({
          id: authData.user.id,
          name: onboarding.name,
          email,
          goal: onboarding.goal,
          age_range: onboarding.ageRange,
          height_cm: onboarding.heightCm,
          weight_kg: onboarding.weightKg,
        });

        // Create cycle
        if (onboarding.lastPeriodDate) {
          await supabase.from("cycles").insert({
            user_id: authData.user.id,
            start_date: onboarding.lastPeriodDate.toISOString().split("T")[0],
            cycle_length: onboarding.cycleLength,
            flow_length: onboarding.flowLength,
            is_current: true,
          });
        }

        // Create settings
        await supabase.from("cycle_settings").insert({
          user_id: authData.user.id,
          cycle_length: onboarding.cycleLength,
          flow_length: onboarding.flowLength,
        });

        // Save health conditions
        if (onboarding.healthConditions.length > 0) {
          await supabase.from("health_conditions").insert(
            onboarding.healthConditions.map((condition) => ({
              user_id: authData.user!.id,
              condition,
            })),
          );
        }

        setAuthenticated(true);
        setOnboardingComplete(true);
        router.replace("/(onboarding)/welcome");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar conta";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingLayout
      step={28}
      title="Crie sua conta"
      subtitle="Salve seus dados e acesse de qualquer dispositivo."
    >
      <View style={styles.form}>
        <Input
          label="E-mail"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Senha"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title="Criar conta"
          onPress={handleCreateAccount}
          variant="pill"
          fullWidth
          loading={loading}
          disabled={!email || password.length < 6}
        />
        <Pressable
          onPress={() => {
            setOnboardingComplete(true);
            router.replace("/(onboarding)/welcome");
          }}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Continuar sem conta</Text>
        </Pressable>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.xl,
    marginTop: Spacing.xl,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  skipText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
});
