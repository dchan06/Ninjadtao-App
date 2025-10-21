import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";
  


export default function login() {
    return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Page 2!</Text>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center" },
    text: { fontSize: 24 }
});
  