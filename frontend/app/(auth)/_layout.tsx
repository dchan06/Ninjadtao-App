// app/(auth)/_layout.tsx
import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function AuthLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Simulate async work (login check, etc.)
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" /> : <Slot />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

