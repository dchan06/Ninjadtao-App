// app/_layout.tsx
import { Slot, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    const checkLogin = async () => {
      const access = await SecureStore.getItemAsync("access");
      if (!access){
        router.replace("/(auth)");
      }
      else{
        router.replace("../(drawer)");
      }
    };

    checkLogin();
  }, []);
  // Render Slot immediately, do NOT block it
  return <Slot />;
}


