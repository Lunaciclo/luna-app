import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../store/useUserStore";
import { Colors } from "../theme/colors";

export default function Index() {
  const router = useRouter();
  const { setAuthenticated, setOnboardingComplete, loadOnboardingStatus } =
    useUserStore();

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    // 1. Load persisted onboarding flag from SecureStore
    await loadOnboardingStatus();
    const { isOnboardingComplete } = useUserStore.getState();

    // 2. If onboarding was already completed, go straight to the app
    //    (works for both logged-in and skipped-account users)
    if (isOnboardingComplete) {
      // Optionally refresh auth state in the background
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setAuthenticated(true);
        }
      } catch {
        // Ignore — user can still use app without auth
      }
      router.replace("/(app)/today");
      return;
    }

    // 3. Not completed — check if there's an existing session
    //    (edge case: user was logged in but flag got cleared)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setAuthenticated(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, goal")
          .eq("id", session.user.id)
          .single();

        if (profile?.name && profile?.goal) {
          setOnboardingComplete(true);
          router.replace("/(app)/today");
          return;
        }
      }
    } catch {
      // Fall through to onboarding
    }

    // 4. No session or incomplete profile — start onboarding
    router.replace("/(onboarding)/splash");
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
    alignItems: "center",
    justifyContent: "center",
  },
});
