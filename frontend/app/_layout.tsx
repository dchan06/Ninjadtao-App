import { Slot, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import  jwtDecode  from "jwt-decode";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const access = await SecureStore.getItemAsync("access");
        const refresh = await SecureStore.getItemAsync("refresh");

        // No access token = not logged in
        if (!access) {
          router.replace("../(auth)");
          return;
        }

        // Decode and check expiry
        const decoded: any = jwtDecode(access);
        const isExpired = Date.now() >= decoded.exp * 1000;

        if (isExpired) {
          // Try to refresh
          if (!refresh) {
            router.replace("../(auth)");
            return;
          }

          const response = await fetch("http://localhost:8000/api/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
          });

          if (response.ok) {
            const data = await response.json();
            await SecureStore.setItemAsync("access", data.access);
            router.replace("../(drawer)");
          } else {
            // Refresh failed — maybe expired
            await SecureStore.deleteItemAsync("access");
            await SecureStore.deleteItemAsync("refresh");
            router.replace("../(auth)");
          }
        } else {
          // Access token still valid
          router.replace("../(drawer)");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("../(auth)");
      }
    };

    checkLogin();
  }, []);

  return <Slot />;
}



