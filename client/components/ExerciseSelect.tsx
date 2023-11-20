import FontAwesome from "@expo/vector-icons/FontAwesome";
import clsx from "classnames";
import { useEffect, useRef, useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import {
  ExerciseResponse,
  debounce,
  searchExercisesApi,
} from "../core/network-utils";

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

export default function ExerciseSelect({
  name,
  onSelect,
}: {
  name: string;
  onSelect: (s: ExerciseResponse) => void;
}) {
  const ref = useRef<TextInput | null>(null);
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);

  return (
    <View className="px-3 py-2 border border-white-100 relative rounded-md text-white w-full mb-5">
      <Text className="text-sm  text-primary-400 font-semibold">{name}</Text>
      <View className="relative">
        <TextInput
          ref={ref}
          className="text-xl p-0 h-8 text-white"
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
