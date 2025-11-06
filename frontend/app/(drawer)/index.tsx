import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface UserProfile {
  email: string;
  first_name?: string;
  last_name?: string;
  membership_name?: string;
  // add other fields that your backend returns
}

export default function Profile() {
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load token from SecureStore
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("access");
        if (!storedToken) {
          setError("No access token found");
          setLoading(false);
          return;
        }

        setToken(storedToken);
        await fetchUserData(storedToken);
      } catch (err) {
        console.error("Error loading token:", err);
        setError("Error loading token");
      }
    };

    loadToken();
  }, []);

  // Fetch user data using token
  const fetchUserData = async (jwt: string) => {
    console.log(jwt); 
    try {
      const response = await fetch("http://localhost:8000/api/v1.0/user/auth/", {
        method: "GET", // or POST, depending on your API
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data (token may be expired)");
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Could not fetch user data");
    } finally {
      setLoading(false);
    }
  };

  // Render UI
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text>No user data found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Email: {userData.email}</Text>
      {userData.first_name && <Text>Name: {userData.first_name}</Text>}
      {userData.membership_name && <Text>ID: {userData.membership_name}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
