import { Stack } from "expo-router";
import { StyledText, StyledView } from "../../components/Primitives";
import { StatusBar } from "expo-status-bar";

export default function WorkoutPage() {
  return (
    <StyledView className="w-full h-full p-5 bg-background-800">
      <Stack.Screen
        options={{
          title: "New Workout",
        }}
      />
      <StyledView className="h-full flex">
        <StyledText className="text-xl text-white">
          Start from a template
        </StyledText>
        <StyledText className="text-lg text-white-500">
          Premade plans with fixed excerises
        </StyledText>
      </StyledView>
      <StatusBar style="light" />
    </StyledView>
  );
}
