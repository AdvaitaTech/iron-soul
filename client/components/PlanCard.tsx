import { useRouter } from "expo-router";
import {
  StyledIcon,
  StyledPressable,
  StyledText,
  StyledView,
} from "./Primitives";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, Text, View } from "react-native";
import { PlanResponse } from "../core/network-utils";

export const NewPlanCard = () => {
  const router = useRouter();
  return (
    <StyledPressable
      className="w-[100] h-[150] rounded border border-white-800 flex items-center justify-center relative"
      onPress={() => {
        router.push("/home/plan");
      }}
    >
      <StyledIcon name="plus" size={32} color="#ffffff" />
      <StyledText className="text-white absolute bottom-2 w-full text-center">
        New Plan
      </StyledText>
    </StyledPressable>
  );
};

export default function PlanCard({ plan }: { plan: PlanResponse }) {
  const router = useRouter();

  return (
    <View className="w-[100] h-[150] rounded border border-white-800 flex items-center justify-center relative">
      <StyledText className="text-white text-center">{plan.name}</StyledText>
      <Pressable
        className="absolute bottom-2 text-center py-1 px-3 bg-primary-400 rounded-lg"
        onPress={() => router.push(`/home/workout?plan=${plan.id}`)}
      >
        <Text className="text-white-400 font-semibold">Work Out</Text>
      </Pressable>
    </View>
  );
}
