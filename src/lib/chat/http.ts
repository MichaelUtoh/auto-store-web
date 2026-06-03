import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

/** Chat HTTP client without global auth/toast interceptors — tokens set per request. */
export const chatHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}
