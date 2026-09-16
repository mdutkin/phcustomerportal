// Maps PrimeRX-shaped API responses onto the view types the screens already
// use, so wiring real data didn't require rewriting every screen.
//
// NOTE: PrimeRX's list endpoint carries less than the old mock did — there's no
// prescriber, indication ("purpose") or price on a claim row. Those come back
// blank rather than invented; the detail endpoint does return the prescriber.

import type { Patient, Prescription, StatusTone } from "../data";
import type { ApiRx, Me } from "./types";
import { PHARMACY_FULL } from "./pharmacy";
import { fmtDate as fmtApiDate, parseApiDate } from "./dates";

const DAY_MS = 86_400_000;

const fmtDate = (iso: string | null) => fmtApiDate(iso);

function addDays(iso: string, days: number): Date {
  return new Date((parseApiDate(iso)?.getTime() ?? NaN) + days * DAY_MS);
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
function derivedStatus(
  rx: ApiRx,
  daysLeft: number | null,
  daysOverdue: number | null,
): { status: string; tone: StatusTone } {
  // Filed/deferred by the pharmacy — on file, but never dispensed. Say so
  // plainly (with the reason when we have one) instead of implying it's a live
  // medication the patient is taking.
  if (!rx.dispensed) {
    return { status: rx.filedReason ? `On file — ${rx.filedReason.toLowerCase()}` : "Not dispensed", tone: "neutral" };
  }
  // Waiting at the counter — the most actionable thing we can tell a patient,
  // so it outranks any refill messaging.
  if (rx.handoff === "ready_for_pickup") {
    return { status: "Ready for pickup", tone: "info" };
  }
  if (rx.handoff === "awaiting_delivery") {
    return { status: "Out for delivery", tone: "info" };
  }
  // The pharmacy's own verdicts that end the conversation regardless of the
  // refill count — an expired or discontinued script can't be refilled even
  // with refills "left" on paper.
  if (rx.refillEligibility === "expired") return { status: "Expired — call to renew", tone: "warning" };
  if (rx.refillEligibility === "discontinued") return { status: "Discontinued", tone: "neutral" };
  // Spending an authorised refill is fine for any prescription, controlled or
  // not. It's the RENEWAL that differs: a controlled medication with no refills
  // left needs the prescriber contacted, so it can't become a routine request.
  // PrimeRX also times out controlled refills (CII never; CIII–CV 180 days
  // after the order), which lands in the same "talk to us" bucket.
  if (
    (rx.refillsRemaining <= 0 && (rx.deaClass ?? 0) > 0) ||
    rx.refillEligibility === "controlled_not_refillable"
  ) {
    return { status: "Call to renew", tone: "warning" };
  }
  // No refills authorised: only the prescriber can help. If the pharmacy has
  // already asked them, say so — otherwise the patient chases something that's
  // already in flight.
  if (rx.refillsRemaining <= 0) {
    return rx.renewalRequestedAt
      ? { status: "Renewal requested", tone: "info" }
      : { status: "No refills left", tone: "danger" };
  }
  // Supply has run out, but refills are available → actionable, and urgent.
  // Say HOW overdue when the pharmacy tracks it: "ran out 34 days ago" is a
  // different conversation from "time to reorder".
  if (daysOverdue !== null && daysOverdue > 0) {
    return { status: `Ran out ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} ago`, tone: "danger" };
  }
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
  const filled = parseApiDate(rx.lastFilledAt)?.getTime();
  if (filled == null) return false;
  return Date.now() - filled <= windowDays * DAY_MS;
}

export function apiRxToPrescription(rx: ApiRx): Prescription {
  // Prefer the pharmacy's own refill-due calculation over ours: it accounts for
  // quantity remaining and pickup thresholds, and it's the number staff see, so
  // the patient and the counter can't disagree about a date. Fall back to our
  // derived value for prescriptions they don't track.
  const theirDays = rx.refillDaysRemaining;
  const daysLeft =
    theirDays != null ? Math.max(0, theirDays) : daysLeftFrom(rx.lastFilledAt, rx.daysSupply);
  // Their number is signed — negative means already run out. Ours clamps at zero,
  // which discards the most useful adherence signal we have.
  //
  // BUT only for medication the patient is actually on. RefDueView keeps tracking
  // superseded Rx numbers, so an old generation of a drug the patient still takes
  // under a NEWER Rx reports things like -230 days. Telling someone they ran out
  // eight months ago of something they collected last month is worse than saying
  // nothing, so overdue is scoped to current medications.
  const daysOverdue =
    theirDays != null && theirDays < 0 && isCurrentMedication(rx) ? Math.abs(theirDays) : null;
  const { status, tone } = derivedStatus(rx, daysLeft, daysOverdue);
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
    nextRefillDate: rx.refillDueDate
      ? fmtDate(rx.refillDueDate)
      : rx.lastFilledAt && rx.daysSupply
        ? fmtDate(addDays(rx.lastFilledAt, rx.daysSupply).toISOString())
        : "—",
    daysOverdue,
    lastFilled: fmtDate(rx.lastFilledAt),
    rxNumber: rx.rxno,
    prescriber: "", // not on the claim row; detail endpoint has it
    purpose: "", // PrimeRX doesn't carry an indication here
    dispensed: rx.dispensed,
    filedReason: rx.filedReason,
    deaClass: rx.deaClass,
    renewalRequestedAt: rx.renewalRequestedAt,
    lastFilledIso: rx.lastFilledAt,
    handoff: rx.handoff,
    pickupDateIso: rx.pickupDate,
    pickupTime: rx.pickupTime,
    refillEligibility: rx.refillEligibility,
    refillEligibleIso: rx.refillEligibleDate,
    status,
    statusTone: tone,
    price: 0, // pricing isn't exposed to patients yet
  };
}

// ─── Patient profile ────────────────────────────────────────────────────────

const fmtDateLong = (iso: string | null) =>
  fmtApiDate(iso, { month: "long", day: "numeric", year: "numeric" });

function ageFrom(iso: string | null): number {
  const d = parseApiDate(iso);
  if (!d) return 0;
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
      pharmacy: PHARMACY_FULL, prescriber: "", allergies: [],
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
    pharmacy: PHARMACY_FULL,
    prescriber: "",
    // Already resolved to names server-side (PATIENT.ALLERGY itself is a code
    // that reads "0" for everyone — never render it).
    allergies: p.allergies ?? [],
  };
}
