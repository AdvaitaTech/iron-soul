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
import { Text, View } from "react-native";
import { WorkoutResponse } from "../../core/network-utils";

function ListWorkouts({ workouts }: { workouts: WorkoutResponse[] }) {
  if (workouts.length === 0)
    return (
      <StyledText className="text-white text-center mt-20">
        You have no recent workouts
      </StyledText>
    );
  console.log("found");
  return (
    <View className="w-full">
      <View
        key="header"
        className="flex w-full flex-row py-5 border-b border-b-white"
      >
        <Text className="text-white flex-[3] text-lg font-semibold">Plan</Text>
        <Text className="text-white flex-1 text-md font-semibold">Sets</Text>
        <Text className="text-white flex-1 text-md font-semibold">Reps</Text>
        <Text className="text-white flex-[2] text-md font-semibold">
          Weight Moved (kg)
        </Text>
      </View>
      {workouts.map((workout) => {
        const sets = workout.sets.length;
        const reps = workout.sets.reduce((a, w) => a + w.reps, 0);
        const weight = workout.sets.reduce((a, w) => a + w.reps * w.weight, 0);
        console.log("got map", sets, reps, weight);
        return (
          <View key={workout.id} className="flex w-full flex-row my-5">
            <Text className="text-white flex-[3] text-lg font-semibold">
              {workout.name || "Custom"}
            </Text>
            <Text className="text-white flex-1 text-md">{sets}</Text>
            <Text className="text-white flex-1 text-md">{reps}</Text>
            <Text className="text-white flex-[2] text-md">{weight}</Text>
          </View>
        );
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
        <View className="flex-1">
          <ScrollView>
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
            <StyledText className="text-2xl text-white">
              Recent Workouts
            </StyledText>
            <ListWorkouts workouts={workouts} />
          </ScrollView>
        </View>
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
