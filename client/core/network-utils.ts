import { BadDataError, ForbiddenError, InternalError } from "./errors";

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
