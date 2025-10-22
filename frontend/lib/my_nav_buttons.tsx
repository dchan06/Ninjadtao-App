import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export function ProfileButton() {
  const router = useRouter();
  const admin = false; 
if (admin){
  return (
    <TouchableOpacity onPress={() => router.push('../app/(profile)/admin_profile')}>
        <MaterialIcons name="person" size={28} color="black" />
        </TouchableOpacity>
  );
}
return(
    <TouchableOpacity onPress={() => router.push('../(profile)/user_profile')}>
        <MaterialIcons name="person" size={28} color="black" />
        </TouchableOpacity>
)
}