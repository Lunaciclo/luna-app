import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Input } from '../../components/ui/Input';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Spacing } from '../../theme/spacing';

export default function NameScreen() {
  const router = useRouter();
  const { name, setName } = useOnboardingStore();
  const [localName, setLocalName] = useState(name);

  return (
    <OnboardingLayout
      step={4}
      title="Como posso te chamar?"
      subtitle="Vou usar seu nome para personalizar sua experiência."
      onNext={() => {
        setName(localName.trim());
        router.push('/(onboarding)/goal');
      }}
      nextDisabled={localName.trim().length < 2}
    >
      <View style={styles.inputContainer}>
        <Input
          placeholder="Seu nome ou apelido"
          value={localName}
          onChangeText={setLocalName}
          autoFocus
          autoCapitalize="words"
          maxLength={30}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: Spacing.xl,
  },
});
