// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  const isLoggedIn = false; // replace with your auth logic
  return <Redirect href={isLoggedIn ? '/(tabs)' : '/(auth)/login'} />;
}

