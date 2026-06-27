// Thin API client for phcustomerapi. Attaches the current Firebase ID token as
// a Bearer header so the backend can verify + lazily provision the user.
//
// The portal still renders mock data today; this is the seam real fetchers will
// use as backend endpoints land. `syncMe()` is a best-effort call that triggers
// backend user provisioning right after sign-in.

import { auth } from "./firebase";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function authHeader(): Promise<Record<string, string>> {
  const u = auth.currentUser;
  if (!u) return {};
  const token = await u.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
    ...(await authHeader()),
  };
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

// Best-effort: provisions the backend user row on first sign-in. Swallows
// errors so a not-yet-running backend never blocks the auth UX in dev.
export async function syncMe(): Promise<void> {
  try {
    await apiFetch("/me", { method: "GET" });
  } catch {
    /* backend not reachable yet — fine; provisioning happens on first real call */
  }
}
