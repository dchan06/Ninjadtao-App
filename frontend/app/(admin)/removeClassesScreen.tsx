import { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Mock class data (replace with API)
const MOCK_CLASSES = [
  {
    id: "1",
    name: "Muay Thai Fundamentals",
    coach: "Coach A",
    date: "2025-01-10",
    time: "6:00 PM",
  },
  {
    id: "2",
    name: "BJJ All Levels",
    coach: "Coach B",
    date: "2025-01-10",
    time: "7:00 PM",
  },
  {
    id: "3",
    name: "Boxing Conditioning",
    coach: "Coach C",
    date: "2025-01-12",
    time: "5:00 PM",
  },
];

export default function RemoveClassesScreen() {
  const [dateSearch, setDateSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const filteredClasses = MOCK_CLASSES.filter((cls) =>
    cls.date.includes(dateSearch)
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Text style={styles.title}>Remove Classes</Text>
      <TextInput
        style={styles.search}
        placeholder="Search by date (YYYY-MM-DD)"
        value={dateSearch}
        onChangeText={setDateSearch}
      />

      {/* Results */}
      <FlatList
        data={filteredClasses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No classes found for that date</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.classCard}
            onPress={() => {
              setSelectedClass(item);
              setConfirmModal(true);
            }}
          >
            <Text style={styles.className}>{item.name}</Text>
            <Text style={styles.classDetails}>
              {item.date} — {item.time}
            </Text>
            <Text style={styles.classCoach}>Coach: {item.coach}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Confirm Delete Modal */}
      <Modal visible={confirmModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Remove Class?</Text>

            {selectedClass && (
              <>
                <Text style={styles.modalText}>
                  {selectedClass.name}
                </Text>
                <Text style={styles.modalText}>
                  {selectedClass.date} — {selectedClass.time}
                </Text>
                <Text style={styles.modalText}>
                  Coach: {selectedClass.coach}
                </Text>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setConfirmModal(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#E53935" }]}
                onPress={() => {
                  // TODO: Call backend to delete class
                  console.log("Deleted:", selectedClass?.id);
                  setConfirmModal(false);
                }}
              >
                <Text style={[styles.modalBtnText, { color: "white" }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  search: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DDD",
    fontSize: 16,
  },
  empty: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
  classCard: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  className: {
    fontSize: 18,
    fontWeight: "600",
  },
  classDetails: {
    marginTop: 4,
    color: "#444",
  },
  classCoach: {
    marginTop: 4,
    color: "#666",
    fontStyle: "italic",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalBtnText: {
    fontSize: 16,
  },
});
