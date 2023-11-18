import { StyledIcon, StyledText, StyledView } from "./Primitives";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export const NewPlanCard = () => {
  return (
    <StyledView className="px-5 py-8 rounded border border-secondary-400 flex items-center justify-center">
      <StyledIcon name="plus" size={32} className="text-white" />
      <StyledText className="text-white">New Plan</StyledText>
    </StyledView>
  );
};

export default function PlanCard() {}
