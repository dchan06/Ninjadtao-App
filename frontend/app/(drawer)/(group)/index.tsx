import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

const API_BASE = "http://localhost:8000/api";
const BASE_URL = `${API_BASE}/v1.0/user`;

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        <ClassPicker selectedDate={selectedDate} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

/* -------------------- CLASS PICKER -------------------- */

interface ClassItem {
  classId: number;
  class_name: string;
  class_date: string;
  start_time: string;
  end_time: string;
  instructor_name: string;
  booked: boolean;
}

interface ClassPickerProps {
  selectedDate: Date;
}

export function ClassPicker({ selectedDate }: ClassPickerProps) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [bookedClasses, setBookedClasses] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const [memberships, setMemberships] = useState<any[]>([]);
  const [classToBook, setClassToBook] = useState<number | null>(null);

  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<any>(null);

  /* ---------------- REFRESH ACCESS TOKEN ---------------- */

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const refresh = await SecureStore.getItemAsync("refresh");
      if (!refresh) return null;

      const response = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const newAccess = data.access;
      await SecureStore.setItemAsync("access", newAccess);
      return newAccess;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  /* ---------------- FETCH MEMBERSHIPS ---------------- */

  const fetchMemberships = async (retry = false) => {
    try {
      const access = await SecureStore.getItemAsync("access");

      const res = await fetch(`${BASE_URL}/auth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
      });

      if (res.status === 401 && !retry) {
        const newAccess = await refreshAccessToken();
        if (newAccess) return fetchMemberships(true);
      }

      const data = await res.json();

      if (res.ok) {
        setMemberships(data.active_membership || []);
      } else {
        console.warn("Membership fetch failed:", data);
      }
    } catch (err) {
      console.error("Membership error:", err);
    }
  };

  /* ---------------- FETCH CLASSES ---------------- */

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const dateString = selectedDate.toISOString().split("T")[0];
      const userId = await SecureStore.getItemAsync("userId");

      const response = await fetch(
        `${BASE_URL}/classes/?date=${dateString}&userId=${userId}`
      );

      const data = await response.json();
      const fetchedClasses = data.classes || [];

      const backendBookedIds = fetchedClasses
        .filter((cls: ClassItem) => cls.booked)
        .map((cls: ClassItem) => cls.classId);

      setClasses(fetchedClasses);
      setBookedClasses(backendBookedIds);

      await fetchMemberships(); // <--- NEW SAFE MEMBERSHIP FETCH
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [selectedDate]);

  /* ---------------- HANDLE BOOK ---------------- */

  const handleBook = async (classId: number, membershipId: number, retry = false) => {
    try {
      const access = await SecureStore.getItemAsync("access");
      const userId = await SecureStore.getItemAsync("userId");
      console.log(selectedMembership); 

      const response = await fetch(`${BASE_URL}/book-class/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({
          userId: parseInt(userId || "0"),
          classId,
          membershipId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookedClasses((prev) => [...prev, classId]);
      } else {
        console.warn("Booking failed:", data);
      }
    } catch (err) {
      console.error("Booking error:", err);
    }
  };


  /* ---------------- HANDLE CANCEL ---------------- */

  const handleCancel = async (classId: number, retry = false) => {
    try {
      const access = await SecureStore.getItemAsync("access");
      const userId = await SecureStore.getItemAsync("userId");

      const response = await fetch(`${BASE_URL}/cancel-booking/${classId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
      });
      if (response.status === 401 && !retry) {
        const newToken = await refreshAccessToken();
        if (newToken) return handleCancel(classId, true);
      }

      if (response.ok) {
        setBookedClasses((prev) => prev.filter((id) => id !== classId));
        setClasses((prev) =>
          prev.map((cls) =>
            cls.classId === classId ? { ...cls, booked: false } : cls
          )
        );
      }
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  /* ---------------- BOOKING MODAL ---------------- */

const BookingModal = () => {
  const selectedClass = classes.find(c => c.classId === classToBook);

  return (
    <Modal
      visible={bookingModalVisible}
      transparent={false}
      animationType="slide"
      onRequestClose={() => setBookingModalVisible(false)}
    >
      <View style={modalStyles.fullscreen}>

        {/* Close */}
        <TouchableOpacity
          style={modalStyles.closeButton}
          onPress={() => {
            setSelectedMembership(null);
            setBookingModalVisible(false);
          }}
        >
          <Text style={modalStyles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Banner */}
        <View style={modalStyles.bannerContainer}>
          <Image
            source={require("@/assets/images/Njd-Logo.png")}        // Image goes here
            style={modalStyles.banner}
          />
        </View>

        {/* CLASS DETAILS SECTION */}
        {selectedClass && (
          <View style={modalStyles.classDetailsBox}>
            <Text style={modalStyles.classDetailsHeader}>Class Details</Text>

            <Text style={modalStyles.classDetailsName}>
              {selectedClass.class_name}
            </Text>

            <Text style={modalStyles.classDetailsText}>
              Date: {new Date(selectedClass.class_date).toDateString()}
            </Text>

            <Text style={modalStyles.classDetailsText}>
              Time: {selectedClass.start_time} - {selectedClass.end_time}
            </Text>

            <Text style={modalStyles.classDetailsText}>
              Coach: {selectedClass.instructor_name}
            </Text>
          </View>
        )}

        {/* Push membership portion LOWER */}
        <View style={{ marginTop: 40, flex: 1 }}>
          <Text style={modalStyles.title}>Choose Membership</Text>

          <View style={{ marginTop: 10, flex: 1 }}>
            {memberships.length === 0 && (
              <Text style={{ textAlign: "center", color: "#777", marginTop: 20 }}>
                No active memberships available.
              </Text>
            )}

            <FlatList
              data={memberships}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => {
                const isSelected = selectedMembership === item;

                return (
                  <TouchableOpacity
                    style={[
                      modalStyles.option,
                      isSelected && modalStyles.optionSelected,
                    ]}
                    onPress={() => setSelectedMembership(item)}
                  >
                    <Text style={modalStyles.optionText}>{item.membership}</Text>
                    <Text style={modalStyles.optionSub}>
                      Expires: {new Date(item.expiration_date).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Confirm */}
          <TouchableOpacity
            style={modalStyles.confirmButton}
            onPress={() => {
              if (!selectedMembership) return alert("Select a membership first.");

              handleBook(classToBook!, selectedMembership.id);  // <-- PASS ID
              setBookingModalVisible(false);
              setSelectedMembership(null);
            }}
          >
            <Text style={modalStyles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


  /* ---------------- CLASS LIST ---------------- */

  const renderItem = ({ item }: { item: ClassItem }) => {
    const isBooked = item.booked || bookedClasses.includes(item.classId);

    return (
      <View style={styles.classCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.classTitle}>{item.class_name}</Text>
          <Text style={styles.classTime}>
            {item.start_time} - {item.end_time}
          </Text>
          <Text style={styles.classTime}>Instructor: {item.instructor_name}</Text>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, isBooked && styles.bookedButton]}
          onPress={() => {
            if (!isBooked) {
              setClassToBook(item.classId);
              setBookingModalVisible(true);
            }
          }}
          onLongPress={() => handleCancel(item.classId)}
        >
          <Text style={styles.bookButtonText}>
            {isBooked ? "Booked" : "Book"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <BookingModal />
      <View style={styles.classesContainer}>
        <Text style={styles.dateHeader}>{selectedDate.toDateString()}</Text>

        {loading ? (
          <Text>Loading classes...</Text>
        ) : classes.length === 0 ? (
          <Text style={styles.emptyText}>No classes for this date.</Text>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(item) => item.classId.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
}

/* -------------------- DATE PICKER -------------------- */

interface DatePickerProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export function DatePicker({ selectedDate, setSelectedDate }: DatePickerProps) {
  const today = new Date();
  const dates = Array.from({ length: 31 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d;
  });

  const renderItem = ({ item }: { item: Date }) => {
    const isSelected = item.toDateString() === selectedDate.toDateString();

    return (
      <TouchableOpacity
        style={[styles.dateContainer, isSelected && styles.selectedDate]}
        onPress={() => setSelectedDate(item)}
      >
        <Text style={[styles.dayText, isSelected && styles.selectedText]}>
          {item.toLocaleString("en-US", { weekday: "short" })}
        </Text>
        <Text style={[styles.dateText, isSelected && styles.selectedText]}>
          {item.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.datePickerContainer}>
      <FlatList
        data={dates}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.toDateString()}
        contentContainerStyle={styles.dateListContainer}
      />
    </View>
  );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
  },

  datePickerContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  dateListContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dateContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#caca1b",
  },
  selectedDate: {
    backgroundColor: "#b19231",
  },
  dayText: { fontSize: 12, color: "#333" },
  dateText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  selectedText: { color: "#fff" },

  classesContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  dateHeader: {
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 8,
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  classTime: {
    color: "#666",
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: "#C9A64D",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  bookedButton: {
    backgroundColor: "#A6A82A",
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
});

/* -------------------- MODAL STYLES -------------------- */

const modalStyles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  closeButton: {
  position: "absolute",
  top: 50,
  left: 20,
  zIndex: 10,
  backgroundColor: "#ffffffa2",
  width: 40,      
  height: 40,      
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 20, 
  },
  closeText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000000ff", 
  },
  bannerContainer: {
    width: "100%",
    height: 130,
    marginTop: 40,
  },
  banner: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
    color: "#333",
  },
  option: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 20,
    height: 75,
    justifyContent: "center",
  },
  optionSelected: {
    backgroundColor: "#f6f0d8",
    borderColor: "#C9A64D",
    height: 75,
    justifyContent: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionSub: {
    color: "#666",
    fontSize: 13,
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: "#C9A64D",
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  confirmText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  classDetailsBox: {
  marginTop: 20,
  marginHorizontal: 20,
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 20,
  elevation: 4,
  borderWidth: 1,
  borderColor: "#eee",
  },

  classDetailsHeader: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    color: "#333",
    textAlign: "left",
  },

  classDetailsName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#222",
  },

  classDetailsText: {
    fontSize: 16,
    color: "#555",
    marginVertical: 3,
  },
});
