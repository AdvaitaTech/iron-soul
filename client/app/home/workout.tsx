import clsx from "classnames";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import { Reducer, useEffect, useReducer, useRef, useState } from "react";
import {
  ExerciseResponse,
  PlanResponse,
  createWorkoutApi,
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

type WorkoutState = {
  exercises: {
    exercise: ExerciseResponse | null;
    sets: { weight: string; reps: string }[];
  }[];
  selectedPlanId: string | null;
};
type WorkoutActions =
  | {
      type: "setPlan";
      plan: PlanResponse | null;
    }
  | {
      type: "setExercise";
      index: number;
      exercise: ExerciseResponse | null;
    }
  | {
      type: "addExercise";
    }
  | {
      type: "updateSet";
      exerciseIndex: number;
      setIndex: number;
      newSet: Partial<{ weight: string; reps: string }>;
    }
  | {
      type: "addSet";
      exerciseIndex: number;
    };

const InitialWorkoutState: WorkoutState = {
  selectedPlanId: null,
  exercises: [
    {
      exercise: null,
      sets: [{ weight: "", reps: "" }],
    },
  ],
};

const WorkoutReducer: Reducer<WorkoutState, WorkoutActions> = (
  state,
  action
) => {
  switch (action.type) {
    case "setPlan": {
      if (action.plan === null) {
        return { ...InitialWorkoutState };
      } else
        return {
          selectedPlanId: action.plan ? action.plan.id : null,
          exercises: action.plan.exercises.map((e) => ({
            exercise: e,
            sets: [{ weight: "", reps: "" }],
          })),
        };
    }
    case "setExercise": {
      const currentExercise = state.exercises[action.index];
      return {
        ...state,
        exercises: [
          ...state.exercises.slice(0, action.index),
          { ...currentExercise, exercise: action.exercise },
          ...state.exercises.slice(action.index + 1),
        ],
      };
    }
    case "addExercise": {
      return {
        ...state,
        exercises: [
          ...state.exercises,
          { exercise: null, sets: [{ weight: "", reps: "" }] },
        ],
      };
    }
    case "updateSet": {
      const currentExercise = state.exercises[action.exerciseIndex];
      if (!currentExercise) return state;
      const currentSet =
        state.exercises[action.exerciseIndex].sets[action.setIndex];
      if (!currentSet) return state;
      return {
        ...state,
        exercises: [
          ...state.exercises.slice(0, action.exerciseIndex),
          {
            ...currentExercise,
            sets: [
              ...currentExercise.sets.slice(0, action.setIndex),
              { ...currentSet, ...action.newSet },
              ...currentExercise.sets.slice(action.setIndex + 1),
            ],
          },
          ...state.exercises.slice(action.exerciseIndex + 1),
        ],
      };
    }
    case "addSet": {
      const currentExercise = state.exercises[action.exerciseIndex];
      if (!currentExercise) return state;
      return {
        ...state,
        exercises: [
          ...state.exercises.slice(0, action.exerciseIndex),
          {
            ...currentExercise,
            sets: [...currentExercise.sets, { weight: "", reps: "" }],
          },
          ...state.exercises.slice(action.exerciseIndex + 1),
        ],
      };
    }
  }
};

type ExerciseDetail = {
  exercise: ExerciseResponse | null;
  weight: number;
  reps: number;
};

export default function WorkoutPage() {
  const router = useRouter();
  const { isLoading, plans, error } = usePlans();
  const { plan } = useLocalSearchParams<{ plan?: string }>();
  const [{ selectedPlanId, exercises }, dispatch] = useReducer(WorkoutReducer, {
    ...InitialWorkoutState,
  });

  useEffect(() => {
    if (plans.length === 0 || plan === undefined) return;
    const currentPlan = plans.find((p) => p.id === plan) || null;
    dispatch({ type: "setPlan", plan: currentPlan });
  }, [plans, plan]);

  return (
    <StyledView className="w-full h-full px-5 pt-5 bg-background-800">
      <Stack.Screen
        options={{
          title: "New Workout",
        }}
      />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View className="h-full flex">
          <ScrollView className="h-full flex-1">
            <StyledText className="text-xl text-white">
              Pick your plan
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
              <Pressable
                key="custom"
                className={clsx(
                  "px-5 py-2 rounded border border-white-800 flex items-center justify-center relative",
                  {
                    "bg-primary-200": selectedPlanId === null,
                  }
                )}
                onPress={() =>
                  dispatch({
                    type: "setPlan",
                    plan: null,
                  })
                }
              >
                <StyledText className="text-white text-center">
                  Custom
                </StyledText>
              </Pressable>
              {plans.map((plan) => {
                return (
                  <Pressable
                    key={plan.id}
                    className={clsx(
                      "px-5 py-2 rounded border border-white-800 flex items-center justify-center relative",
                      {
                        "bg-primary-200": selectedPlanId === plan.id,
                      }
                    )}
                    onPress={() =>
                      dispatch({
                        type: "setPlan",
                        plan: plan,
                      })
                    }
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
                          dispatch({
                            type: "setExercise",
                            exercise: e,
                            index: i,
                          });
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
                            dispatch({
                              type: "setExercise",
                              exercise: null,
                              index: i,
                            });
                          }}
                        >
                          <FontAwesome name="close" size={20} color="#d19288" />
                        </Pressable>
                      </View>
                    )}
                    {e.sets.map((set, j) => {
                      return (
                        <View key={j} className="flex flex-row mt-4">
                          <View className="flex-1">
                            <Text className="text-white">Weight (Kgs)</Text>
                            <TextInput
                              keyboardType="number-pad"
                              value={set.weight}
                              className="h-8 w-[80] border-b border-b-white-500 text-white"
                              onChangeText={(t) => {
                                dispatch({
                                  type: "updateSet",
                                  exerciseIndex: i,
                                  setIndex: j,
                                  newSet: {
                                    weight: t,
                                  },
                                });
                              }}
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-white">Reps (Kgs)</Text>
                            <TextInput
                              keyboardType="number-pad"
                              className="h-8 w-[80] border-b border-b-white-500 text-white"
                              value={set.reps}
                              onChangeText={(t) => {
                                dispatch({
                                  type: "updateSet",
                                  exerciseIndex: i,
                                  setIndex: j,
                                  newSet: {
                                    reps: t,
                                  },
                                });
                              }}
                            />
                          </View>
                        </View>
                      );
                    })}

                    <View className="mt-5 flex w-full justify-center items-center">
                      <Pressable
                        className="bg-primary-200 px-4 py-2 rounded-md "
                        onPress={() =>
                          dispatch({
                            type: "addSet",
                            exerciseIndex: i,
                          })
                        }
                      >
                        <Text className="text-white">Add Set</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
              <View className="flex w-full justify-center items-center">
                <Pressable
                  onPress={() =>
                    dispatch({
                      type: "addExercise",
                    })
                  }
                >
                  <FontAwesome name="plus" size={24} color="#ffffff" />
                </Pressable>
              </View>
            </View>
          </ScrollView>
          <Pressable
            className="py-3 bg-primary-400 rounded-lg flex items-center justify-center"
            onPress={() => {
              createWorkoutApi(
                selectedPlanId,
                exercises
                  .filter((e) => e.exercise !== null)
                  .flatMap((ex) => {
                    return ex.sets.map((set) => ({
                      exercise_id: ex.exercise!.id,
                      weight: parseInt(set.weight),
                      reps: parseInt(set.reps),
                    }));
                  })
              ).then(() => {
                router.push("/home");
              });
            }}
          >
            <StyledText className="text-lg text-white-500 font-semibold ">
              End Workout
            </StyledText>
          </Pressable>
        </View>
      )}
      <StatusBar style="light" />
    </StyledView>
  );
}
