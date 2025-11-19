import { LogoutButton } from "@/lib/functions";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  membershipId: string; 
  membership: string;
  purchase_date: string;
  start_date: string;
  expiration_date: string;
  credits_remaining?: number;
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
  active_membership?: MembershipInfo[];
  booked_classes?: BookedClass[];
  is_staff?: boolean; 
}

const API_URL = "http://localhost:8000/api";
const BASE_URL = `${API_URL}/v1.0/user`;

export default function Profile() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // --------------------- For membership pause modal --------------------- //
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [pauseDate, setPauseDate] = useState("");
  const [selectedMembership, setSelectedMembership] = useState<MembershipInfo | null>(null);
  // --------------------------------------------------------------------- //
  const router = useRouter();

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

      const response = await fetch(`http://localhost:8000/api/token/refresh/`, {
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
        {/* Logout Button fixed at bottom */}
        <View style={styles.footer}>
          <LogoutButton />
        </View>
      </SafeAreaView>
    );

  if (!userData)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>No user data found</Text>
        </View>
        {/* Logout Button fixed at bottom */}
        <View style={styles.footer}>
          <LogoutButton />
        </View>
      </SafeAreaView>
    );
  // --- Main UI ---
  return (
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

            {userData.active_membership && userData.active_membership.length > 0 ? (
              userData.active_membership.map((m, index) => {
                const lower = m.membership.toLowerCase();
                const isMonth = lower.includes("month");
                const isCredit = lower.includes("credit");

                return (
                  <View key={index} style={[styles.infoItem, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
                    <View>
                      <Text style={styles.value}>{m.membership}</Text>
                      <Text style={styles.label}>
                        Start: {new Date(m.start_date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.label}>
                        Expires: {new Date(m.expiration_date).toLocaleDateString()}
                      </Text>
                    </View>

                    {/* RIGHT SIDE BUTTON / COUNTER */}
                    {isMonth && (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedMembership(m);
                          setPauseModalVisible(true);
                        }}
                        style={{
                          backgroundColor: "#007bff",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "600" }}>Pause</Text>
                      </TouchableOpacity>
                    )}

                    {isCredit && (
                      <View
                        style={{
                          backgroundColor: "#eee",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontWeight: "600" }}>Credits: {m.credits_remaining}</Text>
                      </View>
                    )}
                  </View>
                );
              })
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
                    {new Date(b.classId.class_date).toLocaleString()} —{" "}
                    {b.classId.instructor_name}
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

        {/* Pause Membership Modal */}
        <Modal
          visible={pauseModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setPauseModalVisible(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)"
          }}>
            <View style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 12,
              width: "80%"
            }}>
              <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
                Pause Membership
              </Text>

              <Text style={{ marginBottom: 6 }}>
                Enter a pause start date (minimum 30 days from today)
              </Text>

              <TextInput
                placeholder="YYYY-MM-DD"
                value={pauseDate}
                onChangeText={setPauseDate}
                style={{
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  const minDate = new Date();
                  minDate.setDate(minDate.getDate() + 30);

                  const chosen = new Date(pauseDate);

                  if (isNaN(chosen.getTime())) {
                    alert("Invalid date format.");
                    return;
                  }

                  if (chosen < minDate) {
                    alert("Pause date must be at least 1 month from today.");
                    return;
                  }

                  alert(`Membership paused starting ${pauseDate}`);

                  setPauseModalVisible(false);
                  setPauseDate("");
                }}
                style={{
                  backgroundColor: "#007bff",
                  padding: 10,
                  borderRadius: 8,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                  Confirm Pause
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPauseModalVisible(false)}
                style={{ marginTop: 10 }}
              >
                <Text style={{ textAlign: "center", color: "red" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Logout Button fixed at bottom */}
        <View style={styles.footer}>
          <LogoutButton />
          {userData?.is_staff && (
          <TouchableOpacity
              onPress={() => router.replace("/(admin)")}
              style={styles.adminButton}
          >
            <Text style={styles.adminButtonText}>Admin Panel</Text>
          </TouchableOpacity>
        )}
        </View>
      </View>
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

  //Admin Page button stuff
  adminButton: {
    backgroundColor: "#ff0404ff",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  adminButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  
});