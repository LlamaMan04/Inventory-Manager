import { Stack } from "expo-router";

export default function RootLayout() {
  // Keeps route headers hidden because the app renders its own mobile header.
  return <Stack screenOptions={{ headerShown: false }} />;
}
