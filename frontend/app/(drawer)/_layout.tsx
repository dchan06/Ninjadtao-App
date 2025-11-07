import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
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
          borderColor: "#ddddddff",
        }}
      >
        <Text style={{ color: "#999", fontSize: 14 }}>Ninjadtao Muay Thai Gym</Text>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  // Load Bebas Neue font
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
  });

  if (!fontsLoaded) {
    return null; // wait until font loads
  }

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
          headerStyle: { backgroundColor: "#eecb7eff" },
          headerTintColor: "#333",
          headerTitleStyle: {
            fontFamily: "BebasNeue_400Regular",
            fontSize: 26,
            color: "#333",
          },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="(group)"
        options={{
          title: "Group Classes",
          headerStyle: { backgroundColor: "#eecb7eff" },
          headerTintColor: "#333",
          headerTitleStyle: {
            fontFamily: "BebasNeue_400Regular",
            fontSize: 26,
            color: "#333",
          },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="events"
        options={{
          title: " Events",
          headerStyle: { backgroundColor: "#eecb7eff" },
          headerTintColor: "#333",
          headerTitleStyle: {
            fontFamily: "BebasNeue_400Regular",
            fontSize: 26,
            color: "#333",
          },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
