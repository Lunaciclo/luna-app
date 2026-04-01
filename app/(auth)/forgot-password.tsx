import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setSent(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar email';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Button title="← Voltar" onPress={() => router.back()} variant="ghost" />

        {sent ? (
          <View style={styles.sentContainer}>
            <Text style={styles.sentEmoji}>📧</Text>
            <Text style={styles.sentTitle}>E-mail enviado!</Text>
            <Text style={styles.sentText}>
              Verifique sua caixa de entrada para redefinir sua senha.
            </Text>
            <Button
              title="Voltar ao login"
              onPress={() => router.back()}
              variant="pill"
              fullWidth
            />
          </View>
        ) : (
          <>
            <Text style={styles.title}>Recuperar senha</Text>
            <Text style={styles.subtitle}>
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </Text>
            <View style={styles.form}>
              <Input
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Button
                title="Enviar link"
                onPress={handleReset}
                variant="pill"
                fullWidth
                loading={loading}
                disabled={!email}
              />
            </View>
          </>
        )}
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
    padding: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.text,
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    marginBottom: Spacing['2xl'],
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  form: {
    gap: Spacing.lg,
  },
  sentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  sentEmoji: {
    fontSize: 64,
  },
  sentTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
  },
  sentText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
