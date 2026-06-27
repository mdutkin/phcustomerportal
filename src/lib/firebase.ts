// Firebase web SDK init for the customer portal.
//
// Config comes from Vite build-time env (VITE_FIREBASE_*). In dev we point at
// the local Auth emulator so no real project/SMS is needed; set
// VITE_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 in .env.development.

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "demo-medico-portal",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
};

export const firebaseApp: FirebaseApp = initializeApp(cfg);
export const auth: Auth = getAuth(firebaseApp);

const emulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
if (emulatorHost) {
  connectAuthEmulator(auth, `http://${emulatorHost}`, { disableWarnings: true });
  // The emulator can't run a real reCAPTCHA challenge; bypass app verification.
  auth.settings.appVerificationDisabledForTesting = true;
}

export const usingEmulator = Boolean(emulatorHost);
