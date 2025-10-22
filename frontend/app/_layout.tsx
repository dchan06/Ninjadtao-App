// app/_layout.tsx
import { Slot } from "expo-router";
import React from "react";

export default function RootLayout() {
  return <Slot />; // Render either (auth) or (app) group
}


