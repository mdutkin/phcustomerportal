// Shared prescription selectors.
//
// These live in one place because the dashboard and the prescriptions list must
// agree: they previously disagreed (the dashboard counted every prescription
// ever filled as "active" while the list showed a current/past split), which is
// exactly the kind of drift a patient notices and we don't.

import type { Prescription } from "../data";

/** ~6 months. A fill older than this is history, not current medication. */
const CURRENT_WINDOW_DAYS = 180;

/**
 * Is this part of the patient's current regimen?
 *
 * Refills remaining is the WRONG axis: a medication filled three weeks ago whose
 * last refill is used is still what the patient takes daily — it needs the
 * prescriber to renew it, not archiving. Recency of an actual dispense is what
 * separates "I take this" from history. Filed/deferred scripts were never handed
 * over at all, so they're never current.
 */
export function isCurrent(m: Prescription): boolean {
  if (m.dispensed === false || !m.lastFilledIso) return false;
  const t = new Date(m.lastFilledIso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= CURRENT_WINDOW_DAYS * 86_400_000;
}

export const selectCurrent = (all: Prescription[]) => all.filter(isCurrent);
export const selectPast = (all: Prescription[]) => all.filter((m) => !isCurrent(m));

/** Current medications the patient can actually refill right now. */
export const selectRefillable = (all: Prescription[]) =>
  selectCurrent(all).filter((m) => m.refillsRemaining > 0);

/** Current medications with no refills left — these need a new prescription. */
export const selectNeedsRenewal = (all: Prescription[]) =>
  selectCurrent(all).filter((m) => m.refillsRemaining <= 0);

/** Filled, billed and sitting on the shelf waiting to be collected. */
export const selectReadyForPickup = (all: Prescription[]) =>
  all.filter((m) => m.handoff === "ready_for_pickup");

/** Fills that are on a delivery run but haven't been handed over yet. */
export const selectOutForDelivery = (all: Prescription[]) =>
  all.filter((m) => m.handoff === "awaiting_delivery");

/** Most recently delivered/collected fills, newest first. */
export function selectRecentlyReceived(all: Prescription[], limit = 3): Prescription[] {
  return all
    .filter((m) => m.handoff === "delivered" || m.handoff === "picked_up")
    .sort((a, b) => (b.pickupDateIso ?? "").localeCompare(a.pickupDateIso ?? ""))
    .slice(0, limit);
}


/**
 * How much attention does this need? Lower sorts first.
 *
 * A dashboard should answer "what do I need to do?", so order by what the
 * patient can act on rather than by what was filled most recently — otherwise
 * the list is dominated by whatever happened to be dispensed last, which is
 * usually the thing needing the least attention.
 */
export function attentionRank(m: Prescription): number {
  if (m.handoff === "ready_for_pickup") return 0; // go and collect it
  if (m.handoff === "awaiting_delivery") return 1; // on its way
  if (m.dispensed === false) return 6; // never dispensed — least useful here
  const out = m.daysLeft != null && m.daysLeft <= 0;
  if (m.refillsRemaining > 0 && out) return 2; // out of supply, can refill now
  if (m.refillsRemaining > 0 && m.daysLeft != null && m.daysLeft <= 7) return 3; // running low
  if (m.refillsRemaining <= 0) return 4; // needs a renewal from the prescriber
  return 5; // comfortably supplied
}

/** Current medications, most-needing-attention first. */
export function selectByAttention(all: Prescription[]): Prescription[] {
  return [...selectCurrent(all)].sort((a, b) => {
    const r = attentionRank(a) - attentionRank(b);
    if (r !== 0) return r;
    // Within a band, whoever runs out soonest comes first.
    const ad = a.daysLeft ?? Number.MAX_SAFE_INTEGER;
    const bd = b.daysLeft ?? Number.MAX_SAFE_INTEGER;
    return ad - bd;
  });
}
