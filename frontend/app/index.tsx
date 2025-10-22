import { Redirect } from "expo-router";

export default function Index() {
  const userIsLoggedIn = true; // 👈 replace with your real auth check

  if (userIsLoggedIn) {
    return <Redirect href="/(tabs)/booking" />;
  } else {
    return <Redirect href="/(auth)/login"/>;
  }
}


