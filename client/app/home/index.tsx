import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

function ListWorkouts() {
  return <View />;
}

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState([]);

  return (
    <View className="bg-background-800 w-full h-full p-5">
      <Stack.Screen
        options={{
          title: "Workouts",
        }}
      />
      <View className="h-full flex">
        <View className="flex-1">
          {workouts.length === 0 ? (
            <Text className="text-white text-center mt-20">
              You have no recent workouts
            </Text>
          ) : (
            <ListWorkouts />
          )}
        </View>
        <Pressable className="mt-10 py-3 bg-primary-400 rounded-lg flex items-center justify-center">
          <Text className="text-lg text-white-500 font-semibold ">
            Start Workout
          </Text>
        </Pressable>
      </View>
      <StatusBar style="light" />
    </View>
  );
}
