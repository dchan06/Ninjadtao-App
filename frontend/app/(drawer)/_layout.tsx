import { Ionicons } from "@expo/vector-icons";
import { DrawerItemList } from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { Image, Text, View } from "react-native";

function CustomDrawerContent(props: any) {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* --- PROFILE SECTION --- */}
      <View
        style={{
          alignItems: "center",
          paddingVertical: 40,
          borderBottomWidth: 1,
          borderColor: "#ddd",
        }}
      >
        <Image
          source={require("@/assets/images/Njd-Logo.png")} 
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
        />
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>John Doe</Text>
        <Text style={{ color: "#666" }}>john.doe@example.com</Text>
      </View>

      {/* --- NAVIGATION ITEMS --- */}
      <View style={{ flex: 1, paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </View>

      {/* --- FOOTER (OPTIONAL) --- */}
      <View
        style={{
          paddingVertical: 20,
          alignItems: "center",
          borderTopWidth: 1,
          borderColor: "#ddd",
        }}
      >
        <Text style={{ color: "#999", fontSize: 14 }}>Ninjadtao Muay Thai Gym</Text>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: "#007bff",
        drawerInactiveTintColor: "#666",
        drawerActiveBackgroundColor: "#e6f0ff",
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Profile",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="(group)"
        options={{
          title: "Group Classes",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      
    </Drawer>
  );
}

