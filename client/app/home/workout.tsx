import clsx from "classnames";
import { Stack, useLocalSearchParams } from "expo-router";
import { StyledText, StyledView } from "../../components/Primitives";
import { StatusBar } from "expo-status-bar";
import { Picker } from "@react-native-picker/picker";
import { usePlans } from "../../core/hooks";
import {
  ActivityIndicator,
  Pressable,
  View,
  ScrollView,
  Text,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import {
  ExerciseResponse,
  debounce,
  searchExercisesApi,
} from "../../core/network-utils";
import { TextInput } from "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const debouncedSearch = debounce(
  (
    search: string,
    limit: number,
    offset: number,
    setExercises: (arr: ExerciseResponse[]) => void
  ) => {
    searchExercisesApi(search, limit, offset)
      .then((exercises) => {
        console.log("exers", exercises);
        setExercises(exercises || []);
      })
      .catch((e) => {
        console.error("error fecthing exercises", e);
      });
  },
  500
);

export function ExerciseInput({
  onSelect,
}: {
  onSelect: (s: ExerciseResponse) => void;
}) {
  const ref = useRef<TextInput | null>(null);
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);

  return (
    <View className="relative text-white w-full">
      <View className="relative">
        <TextInput
          ref={ref}
          className={clsx("text-xl p-0 h-8 text-white", {
            "border-b border-b-white": search === "",
          })}
          value={search}
          onChangeText={(t) => {
            if (t === search) return;
            setSearch(t);
            if (t !== "") debouncedSearch(t, 10, 0, setExercises);
          }}
        ></TextInput>
        {search.length > 0 || exercises.length > 0 ? (
          <Pressable
            className="absolute right-0"
            onPress={() => {
              setSearch("");
              setExercises([]);
            }}
          >
            <FontAwesome name="close" size={20} color="#d19288" />
          </Pressable>
        ) : null}
      </View>
      {exercises.length > 0
        ? exercises.map((e, i) => {
            return (
              <Pressable
                key={i}
                className={clsx("py-5 border-white", {
                  "border-t border-b mt-5": i === 0,
                  "border-b": i > 0 && i < exercises.length - 1,
                })}
                onPress={() => {
                  setExercises([]);
                  setSearch(e.name);
                  onSelect(e);
                  setTimeout(() => {
                    ref.current?.blur();
                  });
                }}
              >
                <Text className="text-white text-xl">{e.name}</Text>
              </Pressable>
            );
          })
        : null}
    </View>
  );
}

type ExerciseDetail = {
  exercise: ExerciseResponse | null;
  weight: number;
  reps: number;
};
export default function WorkoutPage() {
  const { isLoading, plans, error } = usePlans();
  const { plan } = useLocalSearchParams<{ plan?: string }>();
  const [exercises, setExercises] = useState<ExerciseDetail[]>([
    { exercise: null, weight: 0, reps: 0 },
  ]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (plans.length === 0 || plan === undefined) return;
    setPlan(plan);
  }, [plans, plan]);

  const setPlan = (planId: string | null) => {
    setCurrentPlanId(planId);
    const current = plans.find((p) => p.id === planId);
    if (!current) {
      setExercises([{ exercise: null, weight: 0, reps: 0 }]);
      return;
    }
    const newExercises = current.exercises.map((e) => ({
      exercise: e,
      weight: 0,
      reps: 0,
    }));
    setExercises(newExercises);
  };

  const setExerciseDetail = (
    index: number,
    details: Partial<ExerciseDetail>
  ) => {
    const currentExercise = exercises[index];
    setExercises([
      ...exercises.slice(0, index),
      {
        ...currentExercise,
        ...details,
      },
      ...exercises.slice(index + 1),
    ]);
  };

  return (
    <StyledView className="w-full h-full p-5 bg-background-800">
      <Stack.Screen
        options={{
          title: "New Workout",
        }}
      />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <ScrollView className="h-full flex">
          <StyledText className="text-xl text-white">Pick your plan</StyledText>
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
            <Pressable
              key="custom"
              className={clsx(
                "px-5 py-2 rounded border border-white-800 flex items-center justify-center relative",
                {
                  "bg-primary-200": currentPlanId === null,
                }
              )}
              onPress={() => setPlan(null)}
            >
              <StyledText className="text-white text-center">Custom</StyledText>
            </Pressable>
            {plans.map((plan) => {
              return (
                <Pressable
                  key={plan.id}
                  className={clsx(
                    "px-5 py-2 rounded border border-white-800 flex items-center justify-center relative",
                    {
                      "bg-primary-200": currentPlanId === plan.id,
                    }
                  )}
                  onPress={() => setPlan(plan.id)}
                >
                  <StyledText className="text-white text-center">
                    {plan.name}
                  </StyledText>
                </Pressable>
              );
            })}
          </ScrollView>
          <StyledText className="text-xl text-white">Exercises</StyledText>
          <View className="py-5">
            {exercises.map((e, i) => {
              return (
                <View
                  key={i}
                  className="px-3 py-2 border border-white-100 relative rounded-md text-white w-full mb-5"
                >
                  <Text className="text-white font-semibold mb-4">
                    Exercise {i + 1}
                  </Text>
                  {e.exercise === null ? (
                    <ExerciseInput
                      onSelect={(e) => {
                        setExerciseDetail(i, { exercise: e });
                      }}
                    />
                  ) : (
                    <View>
                      <Text className="text-xl p-0 h-8 text-white">
                        {e.exercise.name}
                      </Text>
                      <Pressable
                        className="absolute right-0"
                        onPress={() => {
                          setExerciseDetail(i, {
                            exercise: null,
                            weight: 0,
                            reps: 0,
                          });
                        }}
                      >
                        <FontAwesome name="close" size={20} color="#d19288" />
                      </Pressable>
                    </View>
                  )}
                  <View className="flex flex-row mt-4">
                    <View className="flex-1">
                      <Text className="text-white">Weight (Kgs)</Text>
                      <TextInput
                        keyboardType="number-pad"
                        className="h-8 w-[80] border-b border-b-white-500 text-white"
                        onChangeText={(t) => {
                          setExerciseDetail(i, { weight: parseInt(t) });
                        }}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white">Reps (Kgs)</Text>
                      <TextInput
                        keyboardType="number-pad"
                        className="h-8 w-[80] border-b border-b-white-500 text-white"
                        onChangeText={(t) => {
                          setExerciseDetail(i, { reps: parseInt(t) });
                        }}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
            <View className="flex w-full justify-center items-center">
              <Pressable
                onPress={() =>
                  setExercises([
                    ...exercises,
                    { exercise: null, weight: 0, reps: 0 },
                  ])
                }
              >
                <FontAwesome name="plus" size={24} color="#ffffff" />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
      <StatusBar style="light" />
    </StyledView>
  );
}
