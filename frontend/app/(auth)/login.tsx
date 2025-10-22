import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { Alert, Button, Switch, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async () => {
    const isValid = username === "admin" && password === "password123";
    if (isValid) {
      if (rememberMe) {
        await SecureStore.setItemAsync("user", JSON.stringify({ username }));
      }
      router.replace("../(app)/(tabs)/booking"); // ✅ first page after login
    } else {
      Alert.alert("Error", "Invalid username or password");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={{ borderWidth: 1, width: "80%", marginBottom: 10, padding: 8 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, width: "80%", marginBottom: 10, padding: 8 }} />
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <Switch value={rememberMe} onValueChange={setRememberMe} />
        <Text style={{ marginLeft: 8 }}>Remember me</Text>
      </View>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
