import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Alert, Button, View } from "react-native";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Delete the JWT token (and optionally refresh token)
      await SecureStore.deleteItemAsync("access");
      await SecureStore.deleteItemAsync("refresh");

      // Optional confirmation
      console.log("User logged out successfully");

      // Redirect to login route
      router.replace("/(auth)");
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "There was a problem logging out.");
    }
  };

  return (
    <View style={{ margin: 20 }}>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}