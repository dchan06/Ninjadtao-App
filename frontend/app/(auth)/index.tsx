import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "http://localhost:8000";

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
      const response = await fetch(`${BASE_URL}/api/v1.0/user/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync("access", data.access);
        await SecureStore.setItemAsync("refresh", data.refresh);
        await SecureStore.setItemAsync("userId", data.userId.toString());
        router.replace("../(drawer)");
      } else {
        Alert.alert("Login failed", data.detail || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/login-bg.jpg")} // <-- background image
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Image
            source={require("@/assets/images/Njd-Logo-Rounded.png")} // <-- logo
            style={styles.logo}
          />

          <Text style={styles.title}>NINJADTAO MUAY THAI</Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#777"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#C9A64D" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>LOGIN</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    padding: 28,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(201,166,77,0.4)", // gold tint
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#111",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    width: "100%",
    backgroundColor: "#f2f2f2",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 12,
    fontSize: 16,
    color: "#000",
  },

  button: {
    width: "100%",
    backgroundColor: "#C9A64D", // gold
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 22,
  },

  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
