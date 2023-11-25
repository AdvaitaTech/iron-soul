import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyledPressable,
  StyledText,
  StyledView,
} from "../../components/Primitives";
import PlanCard, { NewPlanCard } from "../../components/PlanCard";
import { ScrollView } from "react-native-gesture-handler";
import { usePlans, useWorkouts } from "../../core/hooks";
import { View } from "react-native";
import { WorkoutResponse } from "../../core/network-utils";

function ListWorkouts({ workouts }: { workouts: WorkoutResponse[] }) {
  if (!workouts)
    return (
      <StyledText className="text-white text-center mt-20">
        You have no recent workouts
      </StyledText>
    );
  return (
    <View className="">
      {workouts.map((workout) => {
        return <View className="flex"></View>;
      })}
    </View>
  );
}

export default function HomeScreen() {
  const {
    isLoading: isWorkoutLoading,
    workouts,
    error: workoutsError,
  } = useWorkouts();
  const { isLoading, plans, error } = usePlans();
  const router = useRouter();
  console.log("plans", plans);

  return (
    <StyledView className="bg-background-800 w-full h-full p-5">
      <Stack.Screen
        options={{
          title: "Workouts",
        }}
      />
      <StyledView className="h-full flex">
        <StyledView className="flex-1">
          <StyledText className="text-2xl text-white">Your Plans</StyledText>
          <StyledText className="text-xl text-white-500">
            Quick workouts with fixed exercises
          </StyledText>
          <ScrollView
            horizontal
            contentContainerStyle={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "row",
              gap: 10,
            }}
            className="py-5 flex-grow-0"
          >
            {plans.map((plan) => {
              return <PlanCard key={plan.id} plan={plan} />;
            })}
            <NewPlanCard />
          </ScrollView>
          <StyledText className="text-2xl text-white">Your Workouts</StyledText>
          <StyledView>
            <ListWorkouts workouts={workouts} />
          </StyledView>
        </StyledView>
        <StyledPressable
          className="mt-10 py-3 bg-primary-400 rounded-lg flex items-center justify-center"
          onPress={() => router.push("/home/workout")}
        >
          <StyledText className="text-lg text-white-500 font-semibold ">
            Start Workout
          </StyledText>
        </StyledPressable>
      </StyledView>
      <StatusBar style="light" />
    </StyledView>
  );
}
