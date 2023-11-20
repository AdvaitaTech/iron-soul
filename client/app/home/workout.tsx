import { Stack } from "expo-router";
import { StyledText, StyledView } from "../../components/Primitives";
import { StatusBar } from "expo-status-bar";
import { Picker } from "@react-native-picker/picker";

export default function WorkoutPage() {
  return (
    <StyledView className="w-full h-full p-5 bg-background-800">
      <Stack.Screen
        options={{
          title: "New Workout",
        }}
      />
      <StyledView className="h-full flex">
        <StyledText className="text-xl text-white">
          Start from a plan
        </StyledText>
        <Picker className="border border-primary-500">
          <Picker.Item color="#ffffff" label="Chest Day" value="chest" />
          <Picker.Item color="#ffffff" label="Back Day" value="back" />
          <Picker.Item
            color="#ffffff"
            label="Legs and Shoulders Day"
            value="legs"
          />
        </Picker>
        <StyledText className="text-lg text-white-500">
          Premade plans with fixed excerises
        </StyledText>
      </StyledView>
      <StatusBar style="light" />
    </StyledView>
  );
}
