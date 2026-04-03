import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

// TEMP: Versão simplificada para diagnosticar crash
// Remove Supabase e SecureStore — vai direto para onboarding
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(onboarding)/splash");
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#E8797A" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F5",
    alignItems: "center",
    justifyContent: "center",
  },
});
