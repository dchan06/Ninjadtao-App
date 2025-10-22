import { style } from "@/lib/style";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Booking() {
const router = useRouter(); 
 
    return (
    <SafeAreaView style={style.container}> 
        {/* HEADER */}
        <View style={style.header}>
        <Image
          source={require("@/assets/images/Njd-Logo.png")}
          style={style.logo}
        /> 
        <Text style = {style.header}>Ninjadtao Muay Thai Gym </Text>
      </View>
      {/* BODY */}
      <View style={style.body}>
        <Text style={style.text}>Name: </Text>
        <Text style ={style.text}>Email Address: </Text>
        <Text style ={style.text}>Password: ********</Text>
        <Text style ={style.text}>Membership Type: </Text>
        <Text style ={style.text}>Membership Expiry Date: </Text>
        <Text style ={style.text}>Date Joined: </Text>
      </View>
      </SafeAreaView>
    );
}

