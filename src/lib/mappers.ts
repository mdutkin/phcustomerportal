// Maps PrimeRX-shaped API responses onto the view types the screens already
// use, so wiring real data didn't require rewriting every screen.
//
// NOTE: PrimeRX's list endpoint carries less than the old mock did — there's no
// prescriber, indication ("purpose") or price on a claim row. Those come back
// blank rather than invented; the detail endpoint does return the prescriber.

import type { Patient, Prescription, StatusTone } from "../data";
import type { ApiRx, Me } from "./types";

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

// Status is phrased as the ACTION the patient can take, not just a diagnosis of
// their supply. Saying "Out of medication" next to "2 of 2 refills" reads as a
// contradiction and gives them nothing to do — if refills are authorised, the
// answer is simply "refill it".
function derivedStatus(rx: ApiRx, daysLeft: number | null): { status: string; tone: StatusTone } {
  // Filed/deferred by the pharmacy — on file, but never dispensed. Say so
  // plainly (with the reason when we have one) instead of implying it's a live
  // medication the patient is taking.
  if (!rx.dispensed) {
    return { status: rx.filedReason ? `On file — ${rx.filedReason.toLowerCase()}` : "Not dispensed", tone: "neutral" };
  }
  // No refills authorised: only the prescriber can help.
  if (rx.refillsRemaining <= 0) return { status: "No refills left", tone: "danger" };
  // Supply has run out, but refills are available → actionable, and urgent.
  if (daysLeft !== null && daysLeft <= 0) return { status: "Refill now", tone: "danger" };
  if (daysLeft !== null && daysLeft <= 7) return { status: "Refill soon", tone: "warning" };
  return { status: "Active", tone: "success" };
}

/**
 * Is this still part of the patient's current regimen? Refills remaining is the
 * wrong axis — a medication filled three weeks ago with its last refill used is
 * very much current, it just needs the prescriber to renew it. Recency of the
 * last real dispense is what actually separates "I take this" from history.
 */
export function isCurrentMedication(rx: ApiRx, windowDays = 180): boolean {
  if (!rx.dispensed || !rx.lastFilledAt) return false;
  const filled = new Date(rx.lastFilledAt).getTime();
  if (Number.isNaN(filled)) return false;
  return Date.now() - filled <= windowDays * DAY_MS;
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
    dispensed: rx.dispensed,
    filedReason: rx.filedReason,
    lastFilledIso: rx.lastFilledAt,
    status,
    statusTone: tone,
    price: 0, // pricing isn't exposed to patients yet
  };
}

// ─── Patient profile ────────────────────────────────────────────────────────

function fmtDateLong(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function ageFrom(iso: string | null): number {
  if (!iso) return 0;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return Math.max(0, age);
}

/** PrimeRX stores phones as bare 10-digit strings; present them nicely. */
function fmtPhone(raw: string | null): string {
  const d = (raw ?? "").replace(/\D/g, "").slice(-10);
  if (d.length !== 10) return raw?.trim() || "—";
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Allergies come as one free-text field; split on common separators. */
function splitAllergies(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;/\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^(nkda|none|n\/a)$/i.test(s));
}

function joinAddress(p: NonNullable<Me["patient"]>): string {
  const cityLine = [p.city, p.state].filter(Boolean).join(", ");
  const tail = [cityLine, p.zip].filter(Boolean).join(" ");
  return [p.addressLine1, p.addressLine2, tail].map((s) => s?.trim()).filter(Boolean).join(", ") || "—";
}

/**
 * Build the view-layer Patient from a /me payload. Only fills what PrimeRX (and
 * our user row) actually provide — no invented conditions, prescriber or plan
 * effective dates. Fields with no source render as "—".
 */
export function apiMeToPatient(me: Me): Patient {
  const p = me.patient;
  if (!p) {
    // Shouldn't happen (the shell only renders once linked) — a safe empty shape.
    return {
      name: "—", initials: "–", dob: "—", age: 0, phone: "—", email: me.user.email ?? "—",
      address: "—", insurance: { plan: "—", member: "—", group: "—" },
      pharmacy: "Medico Pharmacy", prescriber: "", allergies: [],
    };
  }
  const first = p.firstName?.trim() ?? "";
  const last = p.lastName?.trim() ?? "";
  const name = [first, last].filter(Boolean).join(" ") || "—";
  const initials = ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "–";
  return {
    name,
    initials,
    dob: fmtDateLong(p.dob),
    age: ageFrom(p.dob),
    phone: fmtPhone(p.mobile ?? p.phone),
    email: p.email?.trim() || me.user.email || "—",
    address: joinAddress(p),
    insurance: {
      plan: p.primaryInsurance?.trim() || "—",
      member: p.primaryMemberNo?.trim() || "—",
      group: p.primaryGroupNo?.trim() || "—",
    },
    pharmacy: "Medico Pharmacy",
    prescriber: "",
    allergies: splitAllergies(p.allergies),
  };
}
