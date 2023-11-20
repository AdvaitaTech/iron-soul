import { StatusBar } from "expo-status-bar";
import { Slot } from "expo-router";
import "../global.css";

export default function Layout() {
  return (
    <>
      <Slot />
      <StatusBar style="light" />
    </>
  );
}
