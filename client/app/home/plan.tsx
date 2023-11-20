import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import LabelledInput from "../../components/Input";
import { useState } from "react";
import ExerciseSelect from "../../components/ExerciseSelect";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { createPlanApi } from "../../core/network-utils";

type LoadingState = "idle" | "loading" | "success";

export default function PlanPage() {
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<{ id: string; name: string }[]>([
    { id: "", name: "" },
  ]);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const router = useRouter();

  const onSubmit = () => {
    console.log("pressed");
    setLoadingState("loading");
    console.log("loading");
    if (!name) return;
    console.log("called");
    const ids = exercises.filter((e) => e.id !== "").map((e) => e.id);
    if (ids.length === 0) return;

    createPlanApi(name, ids)
      .then(() => {
        console.log("loaded");
        setLoadingState("success");
        router.back();
      })
      .catch((e) => {
        console.log("cuaght error", e);
        setLoadingState("success");
      });
  };

  return (
    <View className="w-full h-full p-5 bg-background-800 flex flex-col">
      <Stack.Screen
        options={{
          title: "New Plan",
        }}
      />
      <ScrollView className="h-full flex-1">
        <LabelledInput
          label="Name"
          textContentType="name"
          value={name}
          className="text-white"
          keyboardType="default"
          onChangeText={(t) => setName(t)}
        />
        {exercises.map((ex, index) => {
          return (
            <ExerciseSelect
              key={index}
              name={`Exercise #${index + 1}`}
              onSelect={(ex) => {
                setExercises([
                  ...exercises.slice(0, index),
                  { id: ex.id, name: ex.name },
                  ...exercises.slice(index + 1),
                ]);
              }}
            />
          );
        })}
        <View className="flex w-full justify-center items-center">
          <Pressable
            onPress={() => setExercises([...exercises, { id: "", name: "" }])}
          >
            <FontAwesome name="plus" size={24} color="#ffffff" />
          </Pressable>
        </View>
      </ScrollView>
      <Pressable
        className="mt-10 py-3 bg-primary-400 rounded-lg flex items-center justify-center"
        onPress={() => onSubmit()}
      >
        {loadingState === "loading" ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-lg text-white-500 font-semibold ">
            Save Plan
          </Text>
        )}
      </Pressable>
    </View>
  );
}
