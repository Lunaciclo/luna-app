import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { useUserStore } from '../store/useUserStore';
import { supabase } from '../lib/supabase';

export default function Index() {
  const router = useRouter();
  const { setAuthenticated, setOnboardingComplete, isOnboardingComplete, isAuthenticated } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setAuthenticated(true);
        // Check if user completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, goal')
          .eq('id', session.user.id)
          .single();

        if (profile?.name && profile?.goal) {
          setOnboardingComplete(true);
          router.replace('/(app)/today');
        } else {
          router.replace('/(onboarding)/splash');
        }
      } else {
        router.replace('/(onboarding)/splash');
      }
    } catch {
      router.replace('/(onboarding)/splash');
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.rose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
