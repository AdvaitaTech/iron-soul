import { ActivityIndicator, StyleSheet } from "react-native";
import LabelledInput from "../components/Input";
import { useEffect, useState } from "react";
import { createAccountApi } from "../core/network-utils";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  StyledPressable,
  StyledText,
  StyledView,
} from "../components/Primitives";

type LoadingState = "idle" | "loading" | "success";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const router = useRouter();

  const onSubmit = () => {
    console.log("pressed");
    setLoadingState("loading");
    console.log("loading");
    if (!email || !password || !confirm) return;
    console.log("called");
    createAccountApi(email, password, confirm)
      .then((res) => {
        console.log("got token", res);
        return SecureStore.setItemAsync("token", res.token);
      })
      .then(() => {
        console.log("loaded");
        setLoadingState("success");
        router.replace("/home");
      })
      .catch((e) => {
        console.log("cuaght error", e);
        setLoadingState("success");
      });
  };

  useEffect(() => {
    SecureStore.getItemAsync("token").then((token) => {
      console.log("got token", token);
      if (token) router.replace("/home");
    });
  }, [SecureStore, router]);

  return (
    <StyledView style={styles.container} className="bg-background-800 px-2">
      <StyledText className="text-white text-3xl mb-20">
        Create your account
      </StyledText>
      <LabelledInput
        label="Email"
        textContentType="emailAddress"
        value={email}
        keyboardType="email-address"
        onChangeText={(t) => setEmail(t)}
      />
      <LabelledInput
        label="Password"
        textContentType="newPassword"
        value={password}
        keyboardType="default"
        onChangeText={(t) => setPassword(t)}
      />
      <LabelledInput
        label="Confirm Password"
        value={confirm}
        keyboardType="default"
        onChangeText={(t) => setConfirm(t)}
      />

      <StyledPressable
        onPress={onSubmit}
        className="w-full mt-10 py-3 bg-primary-400 rounded-lg flex items-center justify-center"
      >
        {loadingState === "loading" ? (
          <ActivityIndicator />
        ) : (
          <StyledText className="text-lg text-white-500 font-semibold ">
            Create Account
          </StyledText>
        )}
      </StyledPressable>
      <StyledText className="text-white mt-5">
        Already have an account?{" "}
        <StyledText
          className="underline text-primary-500"
          onPress={() => {
            router.push("/login");
          }}
        >
          Login
        </StyledText>
      </StyledText>
    </StyledView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
