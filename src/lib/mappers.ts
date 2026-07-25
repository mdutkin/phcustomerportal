// Maps PrimeRX-shaped API responses onto the view types the screens already
// use, so wiring real data didn't require rewriting every screen.
//
// NOTE: PrimeRX's list endpoint carries less than the old mock did — there's no
// prescriber, indication ("purpose") or price on a claim row. Those come back
// blank rather than invented; the detail endpoint does return the prescriber.

import type { Prescription, StatusTone } from "../data";
import type { ApiRx } from "./types";

const DAY_MS = 86_400_000;

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function addDays(iso: string, days: number): Date {
  return new Date(new Date(iso).getTime() + days * DAY_MS);
}

/** Days of medication left, from last fill + days supply. Null if unknowable. */
export function daysLeftFrom(lastFilledAt: string | null, daysSupply: number | null): number | null {
  if (!lastFilledAt || !daysSupply) return null;
  const runsOut = addDays(lastFilledAt, daysSupply).getTime();
  const left = Math.ceil((runsOut - Date.now()) / DAY_MS);
  return Math.max(0, left);
}

function derivedStatus(rx: ApiRx, daysLeft: number | null): { status: string; tone: StatusTone } {
  if (rx.refillsRemaining <= 0) return { status: "No refills left", tone: "danger" };
  if (daysLeft !== null && daysLeft <= 0) return { status: "Out of medication", tone: "danger" };
  if (daysLeft !== null && daysLeft <= 7) return { status: "Refill soon", tone: "warning" };
  return { status: "Active", tone: "success" };
}

export function apiRxToPrescription(rx: ApiRx): Prescription {
  const daysLeft = daysLeftFrom(rx.lastFilledAt, rx.daysSupply);
  const { status, tone } = derivedStatus(rx, daysLeft);
  return {
    id: rx.rxno,
    name: rx.drugName ?? "Prescription",
    strength: rx.drugStrength ?? "",
    form: rx.drugForm ?? "",
    sig: rx.sig ?? "",
    qtyPerFill: rx.qtyOrdered ?? 0,
    daysSupply: rx.daysSupply ?? 0,
    refillsRemaining: rx.refillsRemaining,
    refillsTotal: rx.refillsTotal,
    daysLeft,
    nextRefillDate:
      rx.lastFilledAt && rx.daysSupply
        ? fmtDate(addDays(rx.lastFilledAt, rx.daysSupply).toISOString())
        : "—",
    lastFilled: fmtDate(rx.lastFilledAt),
    rxNumber: rx.rxno,
    prescriber: "", // not on the claim row; detail endpoint has it
    purpose: "", // PrimeRX doesn't carry an indication here
    status,
    statusTone: tone,
    price: 0, // pricing isn't exposed to patients yet
  };
}
