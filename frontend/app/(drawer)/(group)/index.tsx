import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
  id: string;
  title: string;
  time: string;
}

interface ClassPickerProps {
  selectedDate: Date;
}

export function ClassPicker({ selectedDate }: ClassPickerProps) {
  const [bookedClasses, setBookedClasses] = useState<string[]>([]);
  const [holding, setHolding] = useState<string | null>(null);

  // Sample classes
  const allClasses: Record<number, ClassItem[]> = {
    0: [{ id: "1", title: "Sunday Recovery", time: "10:00 - 11:00 AM" }],
    1: [
      { id: "1", title: "Muay Thai Fundamentals", time: "08:00 - 09:00 AM" },
      { id: "2", title: "Advanced Muay Thai", time: "09:30 - 10:30 AM" },
    ],
    2: [
      { id: "3", title: "Pad Work", time: "11:00 - 12:00 PM" },
      { id: "4", title: "Sparring", time: "01:00 - 02:30 PM" },
    ],
    3: [
      { id: "5", title: "Conditioning", time: "06:00 - 07:00 PM" },
      { id: "6", title: "Technique Drills", time: "07:30 - 08:30 PM" },
    ],
    4: [
      { id: "7", title: "Clinching Techniques", time: "05:00 - 06:00 PM" },
      { id: "8", title: "Muay Thai Combinations", time: "06:30 - 07:30 PM" },
    ],
    5: [
      { id: "9", title: "Power Kicks", time: "10:00 - 11:00 AM" },
      { id: "10", title: "Defensive Strategies", time: "11:30 - 12:30 PM" },
    ],
  };

  const weekday = selectedDate.getDay();
  const classes = allClasses[weekday] || [];

  const handleBook = (id: string) => {
    setBookedClasses((prev) => [...prev, id]);
    console.log(`Booked class ID: ${id} on ${selectedDate.toDateString()}`);
  };

  const handleCancel = (id: string) => {
    setBookedClasses((prev) => prev.filter((classId) => classId !== id));
    console.log(`Cancelled class ID: ${id}`);
  };

  const renderItem = ({ item }: { item: ClassItem }) => {
    const isBooked = bookedClasses.includes(item.id);
    const isHolding = holding === item.id;

    return (
      <View style={styles.classCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.classTitle}>{item.title}</Text>
          <Text style={styles.classTime}>{item.time}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            isBooked && styles.bookedButton,
            isBooked && isHolding && { backgroundColor: "#ff4444" },
          ]}
          onPress={() => !isBooked && handleBook(item.id)}
          onLongPress={() => handleCancel(item.id)}
          delayLongPress={2000}
          onPressIn={() => isBooked && setHolding(item.id)}
          onPressOut={() => setHolding(null)}
        >
          <Text style={styles.bookButtonText}>
            {isBooked ? (isHolding ? "Hold to cancel..." : "Booked") : "Book"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.classesContainer}>
      <Text style={styles.dateHeader}>{selectedDate.toDateString()}</Text>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No classes available for this date.</Text>
        }
      />
    </SafeAreaView>
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
    padding: 10,
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

