// Phone sign-in helpers around Firebase Auth.
//
// Sign-up and sign-in are the SAME flow: enter phone → SMS code → verify. On
// success the backend lazily provisions the local user row (keyed by Firebase
// UID) on the first authenticated API call.

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "./firebase";

let verifier: RecaptchaVerifier | null = null;

// Lazily create a single invisible reCAPTCHA verifier bound to a DOM container.
function getVerifier(containerId: string): RecaptchaVerifier {
  if (!verifier) {
    verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  }
  return verifier;
}

// Accepts loose user input ("(555) 555-0100") and returns E.164, US-default.
export function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (raw.trim().startsWith("+")) return "+" + digits;
  if (digits.length === 10) return "+1" + digits;
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  return "+" + digits; // best effort; backend/Firebase will reject if invalid
}

export async function sendSmsCode(
  rawPhone: string,
  recaptchaContainerId: string,
): Promise<ConfirmationResult> {
  const e164 = toE164(rawPhone);
  return signInWithPhoneNumber(auth, e164, getVerifier(recaptchaContainerId));
}

export async function confirmSmsCode(
  confirmation: ConfirmationResult,
  code: string,
): Promise<void> {
  await confirmation.confirm(code);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
