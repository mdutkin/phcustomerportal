// Shared app state — auth flag, prescriptions, cart, billing balance, toasts,
// and the patient profile. Lives at the top of the route tree in App.tsx.

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  BILLING,
  type CartItem,
  MESSAGES,
  PATIENT,
  PRESCRIPTIONS,
  type Patient,
  type Prescription,
} from "./data";
import type { Toast } from "./components/ui";

interface AppCtx {
  authed: boolean;
  setAuthed: (v: boolean) => void;
  patient: Patient;
  prescriptions: Prescription[];
  refillRx: (id: string) => void;
  balance: number;
  payBalance: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (p: import("./data").OtcProduct) => void;
  unreadMsg: number;
  toasts: Toast[];
  pushToast: (text: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(true); // demo: start signed-in
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(PRESCRIPTIONS);
  const [balance, setBalance] = useState<number>(BILLING.total);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const unreadMsg = MESSAGES.filter((m) => m.unread).length;

  const pushToast = (text: string) => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts((cur) => [...cur, { id, text }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 4500);
  };

  const refillRx = (id: string) => {
    setPrescriptions((cur) =>
      cur.map((m) =>
        m.id === id
          ? {
              ...m,
              status: "Refill requested",
              statusTone: "info",
              daysLeft: (m.daysLeft ?? 0) + m.daysSupply,
              refillsRemaining: Math.max(0, m.refillsRemaining - 1),
            }
          : m,
      ),
    );
    pushToast("Refill requested — we'll text you when it's ready.");
  };

  const payBalance = () => {
    setBalance(0);
    pushToast(`Payment received — receipt sent to ${PATIENT.email}.`);
  };

  const addToCart = (p: import("./data").OtcProduct) => {
    setCart((cur) => {
      const existing = cur.find((c) => c.id === p.id);
      if (existing) return cur.map((c) => (c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
      return [...cur, { ...p, qty: 1 }];
    });
    pushToast(`Added ${p.name}`);
  };

  const value: AppCtx = {
    authed,
    setAuthed,
    patient: PATIENT,
    prescriptions,
    refillRx,
    balance,
    payBalance,
    cart,
    setCart,
    addToCart,
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
