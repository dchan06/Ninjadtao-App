import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "http://localhost:8000/api/v1.0/user";

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
}

interface ClassPickerProps {
  selectedDate: Date;
}

export function ClassPicker({ selectedDate }: ClassPickerProps) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [bookedClasses, setBookedClasses] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const dateString = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const response = await fetch(`http://localhost:8000/api/v1.0/user/classes/?date=${dateString}`);
      const data = await response.json();
      setClasses(data); // assumes backend returns list of serialized Classes
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [selectedDate]);

  const handleBook = (id: number) => {
    setBookedClasses((prev) => [...prev, id]);
    console.log(`Booked class ID: ${id} on ${selectedDate.toDateString()}`);
  };

  const handleCancel = (id: number) => {
    setBookedClasses((prev) => prev.filter((classId) => classId !== id));
    console.log(`Cancelled class ID: ${id}`);
  };

  const renderItem = ({ item }: { item: ClassItem }) => {
    const isBooked = bookedClasses.includes(item.classId);

    return (
      <View style={styles.classCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.classTitle}>{item.class_name}</Text>
          <Text style={styles.classTime}>
            {item.start_time} - {item.end_time} 
          </Text>
          <Text style={styles.classTime}>
             Instructor: {item.instructor_name}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.bookButton,
            isBooked && styles.bookedButton,
          ]}
          onPress={() => !isBooked && handleBook(item.classId)}
          onLongPress={() => handleCancel(item.classId)}
        >
          <Text style={styles.bookButtonText}>{isBooked ? "Booked" : "Book"}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.classesContainer}>
      <Text style={styles.dateHeader}>{selectedDate.toDateString()}</Text>
      {loading ? (
        <Text>Loading classes...</Text>
      ) : classes.length === 0 ? (
        <Text style={styles.emptyText}>No classes available for this date.</Text>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.classId.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    const date = new Date();
    date.setDate(today.getDate() + i);
    return date;
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
        keyExtractor={(item) => item.toDateString()}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
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
  dateContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 50, // fixed width for all buttons
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#caca1bff",
  },
  selectedDate: {
    backgroundColor: "#b19231",
  },
  dateListContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
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
  dayText: { fontSize: 12, color: "#333" },
  dateText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  selectedText: { color: "#fff" },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#f8f8f8",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  classTime: {
    fontSize: 14,
    color: "#666",
  },
  bookButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bookedButton: {
    backgroundColor: "green",
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
  },
});

