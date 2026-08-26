// API client for phcustomerapi. Attaches the current Firebase ID token as a
// Bearer header; the backend verifies it and lazily provisions the user row.

import { auth } from "./firebase";
import type { ApiRequest, ApiRx, ApiRxDetail, Me } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

/** Error carrying the backend's machine-readable code, so screens can branch. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const u = auth.currentUser;
  if (!u) return {};
  const token = await u.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  // Only declare a JSON content-type when we're actually sending JSON. Fastify
  // rejects a request that announces application/json but carries no body
  // (FST_ERR_CTP_EMPTY_JSON_BODY), which silently broke every body-less POST
  // such as cancelling a request.
  const headers = {
    ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(init.headers as Record<string, string> | undefined),
    ...(await authHeader()),
  };
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

async function json<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    // Fastify/our error handler returns { error, message }; fall back gracefully.
    let code = String(res.status);
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      code = body.error ?? code;
      message = body.message ?? message;
    } catch {
      /* non-JSON body */
    }
    throw new ApiError(res.status, code, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ─── Identity ─────────────────────────────────────────────────────────────

/** Current user + their PrimeRX link (link === null → not claimed yet). */
export const getMe = () => json<Me>("/me");

/**
 * Self-claim. The phone is NOT sent — the backend uses the number Firebase
 * verified at sign-in as the possession factor.
 */
export const claimPatient = (lastName: string, dob: string) =>
  json<{ ok: true; patient: unknown }>("/me/claim", {
    method: "POST",
    body: JSON.stringify({ lastName, dob }),
  });

// ─── Prescriptions ────────────────────────────────────────────────────────

// The API wraps this one in an envelope: { items: [...] }. Unwrap it here so
// callers get a plain array like every other list endpoint.
export const listPrescriptions = async (): Promise<ApiRx[]> =>
  (await json<{ items: ApiRx[] }>("/prescriptions")).items ?? [];
export const getPrescription = (rxno: string) => json<ApiRxDetail>(`/prescriptions/${rxno}`);

export const requestRefill = (rxno: string, patientNote?: string) =>
  json<{ status: "queued"; refillRequestId: string; rxno: string }>(`/prescriptions/${rxno}/refill`, {
    method: "POST",
    body: JSON.stringify(patientNote ? { patientNote } : {}),
  });

// ─── Requests (the pharmacist queue, patient side) ────────────────────────

export const listRequests = () => json<ApiRequest[]>("/requests");
export const cancelRequest = (id: string) =>
  json<ApiRequest>(`/requests/${id}/cancel`, { method: "POST" });

export interface UpdateDetailsInput {
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  note?: string;
}

/** Demographics changes are a REQUEST — a pharmacist applies them in PrimeRX. */
export const requestUpdateDetails = (input: UpdateDetailsInput) =>
  json<ApiRequest>("/requests/update-details", {
    method: "POST",
    body: JSON.stringify(input),
  });

// Best-effort: provisions the backend user row on first sign-in. Swallows
// errors so a not-yet-running backend never blocks the auth UX in dev.
export async function syncMe(): Promise<void> {
  try {
    await apiFetch("/me", { method: "GET" });
  } catch {
    /* backend not reachable yet — provisioning happens on the first real call */
  }
}
