import { Text, TextInput, TextInputProps, View } from "react-native";
import clsx from "classnames";
import { useState } from "react";

type InputMode = "" | "focused";
type InputProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
} & TextInputProps;

export default function LabelledInput({
  label,
  value,
  onFocus,
  onBlur,
  onChangeText,
  ...inputProps
}: InputProps) {
  const [mode, setMode] = useState<InputMode>("");
  return (
    <View
      className={clsx(
        "px-3 py-2 border border-white-100 relative rounded-md text-white w-full mb-5",
        {
          "border-primary-400": mode === "focused",
        }
      )}
    >
      <Text
        className={clsx(
          "transition-all duration-200 pointer-events-none text-sm text-white-100  font-semibold",
          {
            "text-primary-400": mode === "focused",
          }
        )}
      >
        {label}
      </Text>
      <TextInput
        {...inputProps}
        autoCapitalize="none"
        returnKeyType="done"
        className="text-xl p-0 h-8 text-primary-400"
        value={value}
        onChangeText={onChangeText}
        onBlur={(e) => {
          if (!value) setMode("");
          if (onBlur) onBlur(e);
        }}
        onFocus={(e) => {
          setMode("focused");
          if (onFocus) onFocus(e);
        }}
      />
    </View>
  );
}
