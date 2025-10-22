import { StyleSheet } from "react-native";

export const style = StyleSheet.create({
    container: { flex: 1, 
      backgroundColor: '#fff',
    },
    profile: {  //Added style for the profile button to stay at top left
        position: 'absolute', // take it out of normal layout
        top: 50,              // distance from top edge
        left: 20,             // distance from left edge
        zIndex: 10,           // ensures it's above other elements
    },
    header: {
      alignItems:'center',
      paddingHorizontal:15, 
      paddingVertical:2, 
      backgroundColor: '#fff', 
      fontSize: 23,
      fontWeight: 'bold',
    },
    body: {
      flex:1,
      alignItems:'flex-start',
      justifyContent: 'flex-start', 
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
