import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface UserProfile {
  email: string;
  first_name?: string;
  last_name?: string;
  membership_name?: string;
}

// Use your original local backend URL
const BASE_URL = "http://localhost:8000";

export default function Profile() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const access = await SecureStore.getItemAsync("access");
        if (!access) {
          setError("No access token found");
          setLoading(false);
          return;
        }
        await fetchUserData(access);
      } catch (err) {
        console.error("Error loading token:", err);
        setError("Error loading token");
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Fetch user data using the access token
  const fetchUserData = async (jwt: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1.0/user/auth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });

      // If token expired, try refreshing
      if (response.status === 401) {
        console.log("Access token expired — trying to refresh...");
        const newToken = await refreshAccessToken();
        if (newToken) {
          return fetchUserData(newToken); // Retry once
        } else {
          throw new Error("Session expired. Please log in again.");
        }
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
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

  // Refresh the access token using the stored refresh token
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const refresh = await SecureStore.getItemAsync("refresh");
      if (!refresh) {
        console.warn("No refresh token found");
        return null;
      }

      const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        console.error("Refresh token request failed:", response.status);
        return null;
      }

      const data = await response.json();
      const newAccess = data.access;
      await SecureStore.setItemAsync("access", newAccess);
      console.log("Access token refreshed successfully!");
      return newAccess;
    } catch (err) {
      console.error("Error refreshing token:", err);
      return null;
    }
  };

  // Render logic
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

  console.log("User Data:", userData);

  return (
    <View style={styles.container}>
      <Text>Email: {userData.email}</Text>
      {userData.first_name && <Text>Name: {userData.first_name + " " + userData.last_name}</Text>} 
      {userData.membership_name && <Text>Membership: {userData.membership_name}</Text>}
      <Text>Date Joined: </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
