import { $api, $auth } from "@/app/api/http.ts";
import type { IAdmin, TLoginRequest, TLoginResponse } from "@/app/api/auth/types.ts";

export async function loginApi(data: TLoginRequest): Promise<TLoginResponse> {
  console.log("Logging in with data:", data);

  const response = await $auth.post("/auth/login", data);

  console.log("Received login response:", response.data.data);

  return response.data.data as TLoginResponse;
}

export async function logoutApi(): Promise<void> {
  await $api.post("/auth/logout");
}

export async function getMeApi(): Promise<IAdmin> {
  console.log('Start getMe with accessToken, api layer');
  const response = await $api.get("/auth/me");

  console.log("Received user data from /auth/me:", response);

  return response.data.data as IAdmin;
}
