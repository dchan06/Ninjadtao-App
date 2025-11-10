import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { ActivityIndicator, Alert, Button, Image, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");      
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

  setLoading(true);
  try {
    const response = await fetch("http://localhost:8000/api/v1.0/user/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Attempt to parse JSON
    const data = await response.json();

    if (response.ok) {
      // Save JWT tokens securely
      await SecureStore.setItemAsync("access", data.access);
      await SecureStore.setItemAsync("refresh", data.refresh);
      await SecureStore.setItemAsync("email", JSON.stringify({ email }));

      // Navigate to booking
      router.replace("../(drawer)");
    } else {
      // Only show invalid credentials
      Alert.alert("Login failed", data.detail || "Invalid credentials");
    }
  } catch (err) {
    console.error("Login error:", err);
    // Only show server connection error
    Alert.alert("Error", "Unable to connect to the server.");
  } finally {
    setLoading(false);
  }
  };

  return (
    
    <View style={{ flex: 1}}>
      { /*TOP AREA FOR LOGO & NAME*/ }
      <View style={{flex: 2, alignItems: "center", justifyContent: "flex-end"}}> 
      <Image
          source={require("@/assets/images/Njd-Logo-Rounded.png")}
          style={{ width: 150, height: 150 }}
        />
        <Text style = {{ fontSize: 24, fontWeight: "bold", color: "#333" , paddingVertical: 10}}>
          Ninjadtao Muay Thai Gym</Text>
      </View>

    { /*CENTER AREA FOR LOGIN INPUT*/ }
    <View style={{ flex: 2, justifyContent: "flex-start", alignItems: "center", padding: 20 }}>
    
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}        // updated
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, width: "80%", marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, width: "80%", marginBottom: 10, padding: 8 }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#54541a" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
    </View>

    </View>
  );
}