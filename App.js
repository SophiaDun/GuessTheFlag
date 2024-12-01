
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./Screens/LoginScreen";
import SignUpScreen from "./Screens/SignUpScreen";
import HomeScreen from "./Screens/HomeScreen";
import GameScreen from "./Screens/GameScreen";
import SettingsScreen from "./Screens/SettingsScreen"; 
import IndexScreen from "./Screens/IndexScreen"; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
      <Stack.Screen options={{ headerShown: false }}name="Index" component={IndexScreen} />
        <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
        <Stack.Screen options={{ headerShown: false }} name="Sign Up" component={SignUpScreen} />
        <Stack.Screen options={{ headerShown: false }} name="Home" component={HomeScreen} />
        <Stack.Screen options={{ headerShown: false }} name="Game" component={GameScreen} />
        <Stack.Screen options={{ headerShown: false }} name="Settings" component={SettingsScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
