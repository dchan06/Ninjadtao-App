import { useState } from "react";
import {
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Types
interface ClassItem {
  id: string;
  title: string;
  coach: string;
  date: string;
  time: string;
  duration: string;
}

// Predefined template classes used for “Add Week/Month”
const TEMPLATE_CLASSES: ClassItem[] = [
  {
    id: "1",
    title: "Muay Thai Fundamentals",
    coach: "Coach John",
    date: "",
    time: "6:00 PM",
    duration: "1 hr",
  },
  {
    id: "2",
    title: "Boxing Conditioning",
    coach: "Coach Emily",
    date: "",
    time: "7:30 PM",
    duration: "1 hr",
  },
];

export default function ClassesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  const [pendingClasses, setPendingClasses] = useState<ClassItem[]>([]);

  const [tempTitle, setTempTitle] = useState("");
  const [tempCoach, setTempCoach] = useState("");
  const [tempDate, setTempDate] = useState("");
  const [tempTime, setTempTime] = useState("");
  const [tempDuration, setTempDuration] = useState("");

  // --------------------------
  // CRUD FUNCTIONS
  // --------------------------

  const openAddClassModal = (preFill?: ClassItem) => {
    if (preFill) {
      setEditingClass(preFill);
      setTempTitle(preFill.title);
      setTempCoach(preFill.coach);
      setTempDate(preFill.date);
      setTempTime(preFill.time);
      setTempDuration(preFill.duration);
    } else {
      setEditingClass(null);
      setTempTitle("");
      setTempCoach("");
      setTempDate("");
      setTempTime("");
      setTempDuration("");
    }
    setModalVisible(true);
  };

  const saveClass = () => {
    if (editingClass) {
      // Update existing class
      setPendingClasses((prev) =>
        prev.map((c) =>
          c.id === editingClass.id
            ? {
                ...c,
                title: tempTitle,
                coach: tempCoach,
                date: tempDate,
                time: tempTime,
                duration: tempDuration,
              }
            : c
        )
      );
    } else {
      // Add new class
      const newClass: ClassItem = {
        id: Math.random().toString(),
        title: tempTitle,
        coach: tempCoach,
        date: tempDate,
        time: tempTime,
        duration: tempDuration,
      };
      setPendingClasses((prev) => [...prev, newClass]);
    }

    setModalVisible(false);
  };

  const deleteClass = (id: string) => {
    setPendingClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const clearAllClasses = () => {
    setPendingClasses([]);
  };

  const addTemplateClasses = (days: number) => {
    const today = new Date();

    const newClasses: ClassItem[] = [];

    for (let i = 0; i < days; i++) {
      TEMPLATE_CLASSES.forEach((template) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        newClasses.push({
          ...template,
          id: Math.random().toString(),
          date: date.toISOString().split("T")[0],
        });
      });
    }

    setPendingClasses((prev) => [...prev, ...newClasses]);
  };

  return (
    <View style={styles.container}>
      {/* ------------ ACTION BUTTONS ------------ */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => addTemplateClasses(7)}
        >
          <Text style={styles.buttonText}>Add Week</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => addTemplateClasses(30)}
        >
          <Text style={styles.buttonText}>Add Month</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.individualButton]}
        onPress={() => openAddClassModal()}
      >
        <Text style={styles.buttonText}>Add Individual Class</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={clearAllClasses}
      >
        <Text style={styles.clearText}>Clear All Pending Classes</Text>
      </TouchableOpacity>

      {/* ------------ CLASS LIST ------------ */}
      <FlatList
        data={pendingClasses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pending classes added yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.classCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.classTitle}>{item.title}</Text>
              <Text style={styles.classSub}>{item.coach}</Text>
              <Text style={styles.classSub}>
                {item.date} • {item.time}
              </Text>
              <Text style={styles.classSub}>{item.duration}</Text>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openAddClassModal(item)}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteClass(item.id)}
            >
              <Text style={styles.deleteText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ------------ CLASS MODAL ------------ */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingClass ? "Edit Class" : "Add Class"}
              </Text>

              <TextInput
                placeholder="Class Title"
                style={styles.input}
                value={tempTitle}
                onChangeText={setTempTitle}
              />

              <TextInput
                placeholder="Coach Name"
                style={styles.input}
                value={tempCoach}
                onChangeText={setTempCoach}
              />

              <TextInput
                placeholder="Date (YYYY-MM-DD)"
                style={styles.input}
                value={tempDate}
                onChangeText={setTempDate}
              />

              <TextInput
                placeholder="Time (e.g. 6:00 PM)"
                style={styles.input}
                value={tempTime}
                onChangeText={setTempTime}
              />

              <TextInput
                placeholder="Duration (e.g. 1 hr)"
                style={styles.input}
                value={tempDuration}
                onChangeText={setTempDuration}
              />

              <TouchableOpacity style={styles.saveButton} onPress={saveClass}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F8F8F8",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  button: {
    flex: 1,
    backgroundColor: "#2C67F2",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "600",
  },

  individualButton: {
    marginVertical: 12,
    backgroundColor: "#4A90E2",
  },

  clearButton: {
    backgroundColor: "#EDEDED",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  clearText: {
    color: "#444",
    textAlign: "center",
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontSize: 16,
  },

  classCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  classTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  classSub: {
    color: "#777",
  },

  editButton: {
    backgroundColor: "#2C67F2",
    padding: 8,
    borderRadius: 8,
    marginRight: 5,
  },
  editText: {
    color: "#FFF",
    fontWeight: "600",
  },

  deleteButton: {
    backgroundColor: "#FF4E4E",
    padding: 8,
    borderRadius: 8,
  },
  deleteText: {
    color: "#FFF",
    fontWeight: "700",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    maxHeight: "85%",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FAFAFA",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  saveButton: {
    backgroundColor: "#2C67F2",
    padding: 14,
    borderRadius: 10,
    marginTop: 5,
  },
  saveText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
  },

  closeButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#000",
    borderRadius: 10,
  },
  closeText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "600",
  },
});

