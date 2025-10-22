// app/(app)/_layout.tsx
import { Slot, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AppLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await SecureStore.getItemAsync("user");
        if (!user) {
          router.replace("../../(auth)/login"); // Not logged in → go to login
        }
      } catch (err) {
        console.log("Error checking login:", err);
        router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />; // Render app pages
}
