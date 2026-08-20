// Shared app state — auth flag, prescriptions, cart, billing balance, toasts,
// and the patient profile. Lives at the top of the route tree in App.tsx.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  MESSAGES,
  PATIENT,
  type Patient,
  type Prescription,
} from "./data";
import type { Toast } from "./components/ui";
import { auth } from "./lib/firebase";
import { signOutUser } from "./lib/auth";
import { ApiError, getMe, listPrescriptions, requestRefill } from "./lib/api";
import { apiMeToPatient, apiRxToPrescription } from "./lib/mappers";
import type { Me } from "./lib/types";

interface AppCtx {
  authed: boolean;
  authLoading: boolean;
  firebaseUser: User | null;
  signOut: () => Promise<void>;
  /** Backend identity: me.link === null → not yet linked to a PrimeRX patient. */
  me: Me | null;
  meLoading: boolean;
  refreshMe: () => Promise<void>;
  patient: Patient;
  prescriptions: Prescription[];
  rxLoading: boolean;
  refreshPrescriptions: () => Promise<void>;
  refillRx: (id: string) => Promise<void>;
  unreadMsg: number;
  toasts: Toast[];
  pushToast: (text: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth state is owned by Firebase. `authed` is derived; `authLoading` is true
  // until the first onAuthStateChanged fires (so the router doesn't bounce to
  // /login before Firebase restores the session).
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);
  const authed = firebaseUser !== null;

  // Backend identity. Fetched once we're authed; `link === null` means the user
  // hasn't claimed their PrimeRX patient record yet and must verify first.
  const [me, setMe] = useState<Me | null>(null);
  const [meLoading, setMeLoading] = useState(false);

  const refreshMe = async () => {
    if (!auth.currentUser) {
      setMe(null);
      return;
    }
    setMeLoading(true);
    try {
      setMe(await getMe());
    } catch {
      setMe(null); // stay unlinked; screens surface the error path
    } finally {
      setMeLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!authed) {
      setMe(null);
      return;
    }
    void refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, authLoading]);

  // Real patient profile derived from /me. The mock is only a pre-load fallback
  // to satisfy the non-null type — the shell renders only once linked, so in
  // practice this is always the real record.
  const patient = me?.patient ? apiMeToPatient(me) : PATIENT;

  // Real prescriptions, straight from PrimeRX (via the API). Starts empty —
  // NOT the mock list — so we never show one patient's data to another.
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [rxLoading, setRxLoading] = useState(false);

  const refreshPrescriptions = async () => {
    if (!auth.currentUser) return;
    setRxLoading(true);
    try {
      const rows = await listPrescriptions();
      setPrescriptions(rows.map(apiRxToPrescription));
    } catch (e) {
      // Don't let a failed fetch masquerade as "you have no prescriptions" —
      // that exact silence hid an envelope-shape mismatch here before.
      // eslint-disable-next-line no-console
      console.error("failed to load prescriptions", e);
      setPrescriptions([]);
    } finally {
      setRxLoading(false);
    }
  };

  // Only once the user is actually linked to a patient record.
  useEffect(() => {
    if (me?.link) void refreshPrescriptions();
    else setPrescriptions([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.link?.patientno, me?.link?.dbKind]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const unreadMsg = MESSAGES.filter((m) => m.unread).length;

  const pushToast = (text: string) => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts((cur) => [...cur, { id, text }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 4500);
  };

  // Real refill request: lands in the pharmacist's queue. We do NOT decrement
  // refills locally — nothing is dispensed until a pharmacist acts, so the
  // count must keep coming from PrimeRX.
  const refillRx = async (id: string) => {
    try {
      await requestRefill(id);
      setPrescriptions((cur) =>
        cur.map((m) => (m.id === id ? { ...m, status: "Refill requested", statusTone: "info" } : m)),
      );
      pushToast("Refill requested — the pharmacy will confirm shortly.");
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "request_already_pending") {
        pushToast("You've already requested a refill for this prescription.");
      } else if (err.code === "no_refills_remaining") {
        pushToast("No refills left — your prescriber needs to authorise a new one.");
      } else {
        pushToast(err.message || "Couldn't request that refill. Please try again.");
      }
    }
  };

  const value: AppCtx = {
    authed,
    authLoading,
    firebaseUser,
    signOut: signOutUser,
    me,
    meLoading,
    refreshMe,
    patient,
    prescriptions,
    rxLoading,
    refreshPrescriptions,
    refillRx,
    unreadMsg,
    toasts,
    pushToast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
