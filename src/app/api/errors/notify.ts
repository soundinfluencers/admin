import { toast } from "react-toastify";
import { normalizeApiError, type NormalizedApiError } from "./normalize";

type NotifyOptions = {
  ignore?: (n: NormalizedApiError) => boolean;
};

const notifiedErrors = new WeakSet<object>();

export function notifyApiError(err: unknown, options: NotifyOptions = {}) {
  const n = normalizeApiError(err);
  if (options.ignore?.(n)) return;
  toast.error(n.message, { autoClose: 5000, position: "bottom-center" });
  if (typeof err === "object" && err !== null) notifiedErrors.add(err);
}

// Only an actually displayed notification counts; ignored errors remain visible locally.
export function notifyUnhandledApiError(err: unknown) {
  if (typeof err === "object" && err !== null && notifiedErrors.has(err)) return;
  notifyApiError(err);
}
