import React, { useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function Booking(){
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eee" , padding: 16 }}>
      <DatePicker />
      <ClassPicker />
    </SafeAreaView>
  );
}

interface ClassItem {
  id: string;
  title: string;
  time: string;
}

export function ClassPicker() {
  const [bookedClassId, setBookedClassId] = useState<string | null>(null);

  // Example data — you can fetch this from your DB
  const classes: ClassItem[] = [
    { id: "1", title: "Muay Thai Fundamentals", time: "08:00 - 09:00 AM" },
    { id: "2", title: "Advanced Muay Thai", time: "09:30 - 10:30 AM" },
    { id: "3", title: "Pad Work", time: "11:00 - 12:00 PM" },
    { id: "4", title: "Sparring", time: "01:00 - 02:30 PM" },
    { id: "5", title: "Conditioning", time: "03:00 - 04:00 PM" },
  ];

  const handleBook = (id: string) => {
    setBookedClassId(id);
    console.log(`Booked class ID: ${id}`);
    // later: call backend API to register booking
  };

  const renderItem = ({ item }: { item: ClassItem }) => {
    const isBooked = bookedClassId === item.id;
    return (
      <View style={styles.classCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.classTitle}>{item.title}</Text>
          <Text style={styles.classTime}>{item.time}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, isBooked && styles.bookedButton]}
          onPress={() => handleBook(item.id)}
        >
          <Text style={styles.bookButtonText}>
            {isBooked ? "Booked" : "Book"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.classesContainer}>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}


export function DatePicker() {
  const today = new Date();
  const dates = Array.from({ length: 31 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return date;
  });

  const [selectedDate, setSelectedDate] = useState(today);

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
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingVertical: 10,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: "#eee",
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
    backgroundColor: "#f0f0f0",
  },
  selectedDate: {
    backgroundColor: "#007bff",
  },

    classesContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  dayText: { fontSize: 12, color: "#333" },
  dateText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  selectedText: { color: "#fff" },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3, // for Android shadow
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
});



