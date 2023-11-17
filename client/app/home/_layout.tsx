import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#100A0A",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          color: "#ffffff",
        },
      }}
    />
  );
}
