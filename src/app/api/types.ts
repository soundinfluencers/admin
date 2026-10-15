import type {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

export type ApiRequestOptions = {
  silentError?: boolean;
};

export type ApiRequestConfig =
  AxiosRequestConfig & ApiRequestOptions;

export type RetriableRequestConfig =
  InternalAxiosRequestConfig &
  ApiRequestOptions & {
  _retry?: boolean;
};
