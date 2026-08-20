// Medico Pharmacy's own details — the single source for anything patient-facing
// that says "call us" or names the dispensing pharmacy.
//
// Taken from the pharmacy's own printed documents (the delivery slip and the
// prescriber refill-request fax both carry this letterhead). PrimeRX's
// `Pharmacy` table is a transfer directory and is empty in this database, so
// there is nothing to read it from at runtime — keep it here, in one place, and
// update it here if the store details ever change.

export const PHARMACY = {
  name: "Medico Pharmacy",
  addressLine1: "11779 Santa Monica Blvd",
  city: "Los Angeles",
  state: "CA",
  zip: "90025",
  phone: "(310) 444-9011",
  fax: "(310) 444-0418",
} as const;

/** Digits only, for tel: links. */
export const PHARMACY_TEL = PHARMACY.phone.replace(/\D/g, "");

/** "Medico Pharmacy — 11779 Santa Monica Blvd, Los Angeles, CA 90025" */
export const PHARMACY_FULL = `${PHARMACY.name} — ${PHARMACY.addressLine1}, ${PHARMACY.city}, ${PHARMACY.state} ${PHARMACY.zip}`;
