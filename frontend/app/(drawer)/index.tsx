import { LogoutButton } from "@/lib/functions";
import { useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

class ClassInfo {
  constructor(
    public classId: number,
    public class_name: string,
    public class_date: string,
    public start_time: string,
    public end_time: string,
    public instructor_name: string
  ) {}

  get startDate(): Date {
    return new Date(`${this.class_date}T${this.start_time}`);
  }

  get formattedTime(): string {
    return this.startDate.toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

interface MembershipInfo {
  membership: string;
  purchase_date: string;
  start_date: string;
  expiration_date: string;
}

interface BookedClass {
  id: number;
  booking_date: string;
  classId: ClassInfo; // nested class object from Django
}

interface UserProfile {
  email: string;
  first_name?: string;
  last_name?: string;
  active_membership?: MembershipInfo;
  booked_classes?: BookedClass[];
}

const API_URL = "http://localhost:8000/api";
const BASE_URL = `${API_URL}/v1.0/user`;

export default function Profile() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const access = await SecureStore.getItemAsync("access");
        if (access) await fetchUserData(access);
      };
      loadProfile();
    }, [])
  );

  const fetchUserData = async (jwt: string) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/`, {
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
      
      // --- Format booked class times before saving ---
      if (data.booked_classes) {
        data.booked_classes = data.booked_classes.map((b: any) => {
          const startDate = new Date(`${b.classId.class_date}T${b.classId.start_time}`);
          const endDate = new Date(`${b.classId.class_date}T${b.classId.end_time}`);

          const formattedTime = `${startDate.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })} - ${endDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`;

          return {
            ...b,
            classId: {
              ...b.classId,
              formattedTime, 
            },
          };
        });
      }
      // ------------------ END ------------------
      console.log("Fetched user data:", data);
      setUserData(data)    //Setting the userData to data //{"booked_classes": [{"booking_date": "2025-11-11 11:52", "classId": [Object], "id": 1}], "email": "david@yahoo.com", "first_name": "David", "last_name": "Chan", "membership_name": "1 Month"}
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

      const response = await fetch(`${API_URL}/token/refresh/`, {
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
            {userData.active_membership ? (
              <View>
                <Text style={styles.value}>{userData.active_membership.membership}</Text>
                <Text style={styles.label}>
                  Start: {new Date(userData.active_membership.start_date).toLocaleDateString()}
                </Text>
                <Text style={styles.label}>
                  Expires: {new Date(userData.active_membership.expiration_date).toLocaleDateString()}
                </Text>
              </View>
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
                  <Text style={styles.value}>{b.classId.class_name}</Text>
                  <Text style={styles.label}>
                    {b.classId.formattedTime}
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