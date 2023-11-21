import * as SecureStore from "expo-secure-store";
import {
  BadDataError,
  ForbiddenError,
  InternalError,
  TokenError,
} from "./errors";

export const BASE_URL = "http://localhost:4005";

export type LoginResponse = {
  token: string;
};

export const createAccountApi = async (
  email: string,
  password: string,
  confirm: string
) => {
  const form = new FormData();
  form.append("email", email);
  form.append("password", password);
  form.append("confirm", confirm);
  return fetch(BASE_URL + "/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(form as any),
  })
    .then((res) => {
      switch (res.status) {
        case 400:
          throw new BadDataError(res.statusText);
        case 403:
          throw new ForbiddenError(res.statusText);
        case 500:
          throw new InternalError(res.statusText);
      }
      return res;
    })
    .then((res) => {
      return res.json() as Promise<LoginResponse>;
    });
};

export const loginApi = async (email: string, password: string) => {
  const form = new FormData();
  form.append("email", email);
  form.append("password", password);
  return fetch(BASE_URL + "/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(form as any),
  })
    .then((res) => {
      switch (res.status) {
        case 400:
          throw new BadDataError(res.statusText);
        case 403:
          throw new ForbiddenError(res.statusText);
        case 500:
          throw new InternalError(res.statusText);
      }
      return res;
    })
    .then((res) => {
      return res.json() as Promise<LoginResponse>;
    });
};

export const debounce = <A>(
  func: (this: A, ...args: any[]) => unknown,
  wait: number
): ((this: A, ...args: any[]) => void) => {
  var timeout: NodeJS.Timeout | null = null;
  return function (this: A, ...args: any[]) {
    let context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
};

export type ExerciseResponse = {
  id: string;
  name: string;
  aliases: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  force: string;
  level: string;
  mechanic: string;
  equipment: string;
  category: string;
  instructions: string[];
  description: string[];
  tips: string[];
};

export const searchExercisesApi = async (
  search: string,
  limit: number,
  offset: number
) => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) return [];
  return fetch(
    BASE_URL + `/exercises?name=${search}&limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: {
        Authorization: token,
      },
    }
  ).then(async (res) => {
    return res.json() as Promise<ExerciseResponse[]>;
  });
};

export const createPlanApi = async (name: string, exercises: string[]) => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) return [];
  return fetch(BASE_URL + `/plans`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, exercises }),
  }).then(async (res) => {
    return res.json() as Promise<{}>;
  });
};

export type PlanResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  exercises: ExerciseResponse[];
};

export const fetchPlansApi = async () => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new TokenError("no token available");
  return fetch(BASE_URL + "/plans", {
    headers: {
      Authorization: token,
    },
  }).then((res) => {
    return res.json() as Promise<PlanResponse[]>;
  });
};
