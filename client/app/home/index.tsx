import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyledPressable,
  StyledText,
  StyledView,
} from "../../components/Primitives";

function ListWorkouts() {
  return <StyledView />;
}

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState([]);

  return (
    <StyledView className="bg-background-800 w-full h-full p-5">
      <Stack.Screen
        options={{
          title: "Workouts",
        }}
      />
      <StyledView className="h-full flex">
        <StyledView className="flex-1">
          {workouts.length === 0 ? (
            <StyledText className="text-white text-center mt-20">
              You have no recent workouts
            </StyledText>
          ) : (
            <ListWorkouts />
          )}
        </StyledView>
        <StyledPressable className="mt-10 py-3 bg-primary-400 rounded-lg flex items-center justify-center">
          <StyledText className="text-lg text-white-500 font-semibold ">
            Start Workout
          </StyledText>
        </StyledPressable>
      </StyledView>
      <StatusBar style="light" />
    </StyledView>
  );
}
