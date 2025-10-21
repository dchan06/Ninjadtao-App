import { useRouter } from "expo-router";
import React from "react";
import { Button, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
  
export default function App() {
const router = useRouter(); 
    return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/Njd-Logo.png")}
          style={styles.logo}
        /> 
        <Text style = {styles.header}>Ninjadtao Muay Thai Gym </Text>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        <Text style={styles.text}>Username: </Text>
        <Text style ={styles.text}>Email: </Text>
      </View>



      <Button title="Go to Login" onPress={() => router.push("/(auth)/login")} />
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, 
      backgroundColor: '#fff',
    },
    header: {
      flexDirection:'row',
      alignItems:'flex-start',
      paddingHorizontal:10, 
      paddingVertical:20, 
      backgroundColor: '#f2f2f2', 
      fontSize: 23,
      fontWeight: 'bold',
    },
    body: {
      flex:1,
      alignItems:'flex-start',
      justifyContent: 'center', 
      paddingHorizontal:20,
    },
    logo: {
    width: 75,
    height: 75,
    justifyContent: 'flex-start',
    resizeMode: "contain",
    },
    text: { 
      fontSize: 24, 
      marginVertical: 5,
    },
});
  