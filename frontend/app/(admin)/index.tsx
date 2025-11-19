import { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock user data (replace with API later)
const MOCK_USERS = [
  {
    id: "1",
    name: "David Chan",
    email: "david@example.com",
    avatar: "https://i.pravatar.cc/300?img=1",
    membership: {
      type: "Gold Membership",
      start: "2025-01-01",
      end: "2025-12-31",
    },
  },
  {
    id: "2",
    name: "Emily Johnson",
    email: "emily@example.com",
    avatar: "https://i.pravatar.cc/300?img=5",
    membership: {
      type: "Monthly Pass",
      start: "2025-02-01",
      end: "2025-03-01",
    },
  },
];

export default function UsersScreen() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredUsers = MOCK_USERS.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const openUserModal = (user: any) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  return (
      <View style={styles.container}>

        <TextInput
          style={styles.search}
          placeholder="Search users..."
          value={search}
          onChangeText={setSearch}
        />

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => openUserModal(item)}
            >
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* MODAL */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>

            <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
              <View style={styles.modalBox}>
                <ScrollView>
                  ...
                </ScrollView>
              </View>
            </SafeAreaView>

          </View>
        </Modal>

      </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F5F5F5",
  },
  search: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  userCard: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
  },
  email: {
    fontSize: 14,
    color: "#777",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalBox: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "75%",
  },
  modalAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    marginBottom: 10,
  },
  modalName: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  modalEmail: {
    textAlign: "center",
    color: "#777",
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
  actions: {
    marginTop: 10,
  },
  actionButton: {
    padding: 12,
    backgroundColor: "#EEE",
    borderRadius: 10,
    marginVertical: 6,
  },
  actionText: {
    fontSize: 16,
    textAlign: "center",
  },
  closeButton: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#000",
    marginTop: 20,
  },
  closeText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 16,
  },
});
