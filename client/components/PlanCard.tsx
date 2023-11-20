import { useRouter } from "expo-router";
import {
  StyledIcon,
  StyledPressable,
  StyledText,
  StyledView,
} from "./Primitives";
import FontAwesome from "@expo/vector-icons/FontAwesome";

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

export default function PlanCard() {}
