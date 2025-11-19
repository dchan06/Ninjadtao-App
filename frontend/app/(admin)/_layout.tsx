// app/(admin)/_layout.tsx
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClassesScreen from "./classesScreen";
import UsersScreen from "./index";
import RemoveClassesScreen from "./removeClassesScreen";

const Tab = createMaterialTopTabNavigator();

export default function AdminLayout() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
  {/* --- HEADER WITH BACK BUTTON --- */}
  <View
    style={{
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
    }}
  >
    {/* Left: Back button */}
    <TouchableOpacity onPress={() => router.replace("/(drawer)")} style={{ width: 40 }}>
      <Text style={{ fontSize: 14, fontWeight: "600" }}>Back</Text>
    </TouchableOpacity>

    {/* Center: Title */}
    <Text
      style={{
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "700",
      }}
    >
      Admin Panel
    </Text>

    {/* Right: Invisible placeholder to balance the left */}
    <View style={{ width: 40 }} />
  </View>

  {/* --- TOP SCROLLABLE TABS --- */}
  <Tab.Navigator
    screenOptions={{
      tabBarScrollEnabled: true,
      tabBarItemStyle: { width: 140 },
      tabBarLabelStyle: { fontSize: 14, fontWeight: "600" },
    }}
  >
    <Tab.Screen name="Users" component={UsersScreen} />
    <Tab.Screen name="Add Classes" component={ClassesScreen} />
    <Tab.Screen name="Remove Classes" component={RemoveClassesScreen} />
  </Tab.Navigator>
</SafeAreaView>
  );
}
