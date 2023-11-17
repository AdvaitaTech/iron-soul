import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LabelledInput from "../components/Input";
import { useEffect, useState } from "react";
import { loginApi } from "../core/network-utils";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

type LoadingState = "idle" | "loading" | "success";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const router = useRouter();

  const onSubmit = () => {
    console.log("pressed");
    setLoadingState("loading");
    console.log("loading");
    if (!email || !password) return;
    console.log("called");
    loginApi(email, password)
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
      if (token) router.replace("/home");
    });
  }, [SecureStore, router]);

  return (
    <View style={styles.container} className="bg-background-800 px-2">
      <Text className="text-white text-3xl mb-20">Log in to your account</Text>
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

      <Pressable
        onPress={onSubmit}
        className="w-full mt-10 py-3 bg-primary-400 rounded-lg flex items-center justify-center"
      >
        {loadingState === "loading" ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-lg text-white-500 font-semibold ">Login</Text>
        )}
      </Pressable>
      <Text className="text-white mt-5">
        Don't have an account?{" "}
        <Text
          className="underline text-primary-500"
          onPress={() => {
            router.push("/");
          }}
        >
          Create one
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
