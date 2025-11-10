import { LogoutButton } from "@/lib/functions";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ClassInfo {
  classId: number;
  class_name: string;
  class_description: string;
  class_date: string;
  instructor_name: string;
}

interface BookedClass {
  id: number;
  booking_date: string;
  clasId: ClassInfo; // nested class object from Django
}

interface UserProfile {
  email: string;
  first_name?: string;
  last_name?: string;
  membership_name?: string;
  booked_classes?: BookedClass[];
}

const BASE_URL = "http://localhost:8000/api/v1.0";

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

  const fetchUserData = async (jwt: string) => {
    try {
      const response = await fetch(`${BASE_URL}/user/auth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) return fetchUserData(newToken);
        throw new Error("Session expired. Please log in again.");
      }

      if (!response.ok) throw new Error("Failed to fetch user data");

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Could not fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const refresh = await SecureStore.getItemAsync("refresh");
      if (!refresh) return null;

      const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const newAccess = data.access;
      await SecureStore.setItemAsync("access", newAccess);
      return newAccess;
    } catch {
      return null;
    }
  };

  // --- Render states ---
  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading profile...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );

  if (!userData)
    return (
      <View style={styles.centered}>
        <Text>No user data found</Text>
      </View>
    );

  // --- Main UI ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <Text style={styles.title}>Profile</Text>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{userData.email}</Text>
            </View>

            {userData.first_name && (
              <View style={styles.infoItem}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>
                  {userData.first_name + " " + userData.last_name}
                </Text>
              </View>
            )}

            <View style={styles.infoItem}>
              <Text style={styles.label}>Date Joined</Text>
              <Text style={styles.value}>—</Text>
            </View>
          </View>

          {/* Memberships Card */}
          <View style={styles.profileCard}>
            <Text style={styles.title}>Membership</Text>
            {userData.membership_name ? (
              <Text style={styles.value}>{userData.membership_name}</Text>
            ) : (
              <Text style={styles.label}>No active membership</Text>
            )}
          </View>

          {/* Booked Classes Card */}
          <View style={styles.profileCard}>
            <Text style={styles.title}>Booked Classes</Text>
            {userData.booked_classes && userData.booked_classes.length > 0 ? (
              userData.booked_classes.map((b, index) => (
                <View key={index} style={styles.infoItem}>
                  <Text style={styles.value}>{b.clasId.class_name}</Text>
                  <Text style={styles.label}>
                    {new Date(b.clasId.class_date).toLocaleString()} —{" "}
                    {b.clasId.instructor_name}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.label}>No booked classes</Text>
            )}
          </View>

          {/* Booked Events Card (optional static example) */}
          <View style={styles.profileCard}>
            <Text style={styles.title}>Booked Events</Text>
            <Text style={styles.label}>No booked events</Text>
          </View>
        </ScrollView>

        {/* Logout Button fixed at bottom */}
        <View style={styles.footer}>
          <LogoutButton />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { flex: 1, justifyContent: "space-between", padding: 20 },
  scrollContent: { paddingBottom: 20 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 16,
  },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 16, color: "#333" },
  infoItem: { marginBottom: 14 },
  label: { fontSize: 14, color: "#777" },
  value: { fontSize: 16, fontWeight: "500", color: "#111" },
  footer: { alignItems: "center", marginTop: 10 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
