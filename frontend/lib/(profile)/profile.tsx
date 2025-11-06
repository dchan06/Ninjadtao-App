import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoutButton } from "../../lib/functions";
import { style } from "../../lib/style";

type UserProfile = {
  email: string;
  first_name: string;
  last_name: string;
  "Membership Type": string;
  "Membership Name": string;
};

export default function Profile() {
  const router = useRouter(); 
  const [userData, setData] = useState<UserProfile[]>([]);

  useEffect(() => {
    const loadEmailAndFetch = async () => {
      try {
        const stored = await SecureStore.getItemAsync("email");
        if (stored) {
          const parsed = JSON.parse(stored);
          const email = parsed.email; 
          console.log("Loaded email from SecureStore:", email);          
          await fetchUserData(email);
        } else {
          console.log("No email found in SecureStore");
        }
      } catch (error) {
        console.error("Error loading email:", error);
      }
    };
    loadEmailAndFetch();
  }, []);

const fetchUserData = async (email: string) => {
  try {
    const response = await fetch("http://localhost:8000/api/v1.0/user/profile/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // Always check if response is OK before parsing
    if (!response.ok) {
      console.error(`Server error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log("Server returned:", errorText);
      return; // stop here
    }

    const result = await response.json();
    setData(result);

  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};


  return (
    <SafeAreaView style={style.container}> 
      {/* HEADER */}
      <View style={style.header}>
        <Image
          source={require("@/assets/images/Njd-Logo.png")}
          style={style.logo}
        /> 
        <Text style={style.header}>Ninjadtao Muay Thai Gym</Text>
      </View>
      {/* BODY */}
      <View style={style.body}>
        <Text style={style.text}>
          Name: {userData[0]?.first_name} {userData[0]?.last_name}
        </Text>
        <Text style={style.text}>
          Email Address: {userData[0]?.email}
        </Text>
        <Text style={style.text}>Password: ********</Text>
        <Text style={style.text}>
          Membership Type: {userData[0]?.["Membership Type"]}
        </Text>
        <Text style={style.text}>
          Membership Name: {userData[0]?.["Membership Name"]}
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center" }}>
        <Text>Profile Screen</Text>
        <LogoutButton />
      </View>
    </SafeAreaView>
  );
}
