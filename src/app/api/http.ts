import axios from "axios";
import { API_URL } from "@/shared/config/runtime-config.ts";

export const $api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const $auth = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
