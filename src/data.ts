// Mock data for the patient portal demo.
// Persona: Margaret Chen, 73, hypertension/cholesterol/type 2 diabetes.
// No PHI — replace with API fetchers when the customer-portal backend lands.

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral" | "brand";
export type Flag = "OK" | "H" | "L";

export interface Patient {
  name: string;
  initials: string;
  dob: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  insurance: { plan: string; member: string; group: string };
  pharmacy: string;
  prescriber: string;
  allergies: string[];
}

export interface Prescriber {
  name: string;
  specialty: string;
  clinic: string;
  phone: string;
}

export interface Prescription {
  /** False when the pharmacy filed/deferred it rather than dispensing. */
  dispensed?: boolean;
  filedReason?: string | null;
  /** DEA schedule: 0 = not controlled, 2..5 = CII..CV. */
  deaClass?: number;
  renewalRequestedAt?: string | null;
  /** Days past the pharmacy's refill-due date. Null unless actually overdue. */
  daysOverdue?: number | null;
  /** Raw last-fill date (ISO), for recency logic. */
  lastFilledIso?: string | null;
  /** How the most recent fill reached the patient. */
  handoff?: "delivered" | "picked_up" | "awaiting_delivery" | "ready_for_pickup" | null;
  pickupDateIso?: string | null;
  pickupTime?: string | null;
  id: string;
  name: string;
  strength: string;
  form: string;
  sig: string;
  qtyPerFill: number;
  daysSupply: number;
  refillsRemaining: number;
  refillsTotal: number;
  daysLeft: number | null;
  daysSub?: string;
  nextRefillDate: string;
  lastFilled: string;
  rxNumber: string;
  prescriber: string;
  purpose: string;
  status: string;
  statusTone: StatusTone;
  price: number;
}

export interface MessageSummary {
  id: string;
  from: string;
  who: "pharm" | "doc" | "support";
  lastSnippet: string;
  time: string;
  unread: boolean;
}

export interface ThreadMsg {
  from: "me" | "them";
  text: string;
  time: string;
}

// In the demo, "today" is May 4, 2026 (matches the design copy).
export const TODAY = new Date(2026, 4, 4);

export const PATIENT: Patient = {
  name: "Margaret Chen",
  initials: "MC",
  dob: "March 14, 1953",
  age: 73,
  phone: "(415) 555-0192",
  email: "margaret.chen@example.com",
  address: "1428 Sutter St, Apt 4B, San Francisco, CA 94109",
  insurance: { plan: "Blue Shield PPO", member: "BSC-42-9173-08", group: "GRP-118840" },
  pharmacy: "Maple St. Pharmacy — 240 Maple St, San Francisco",
  prescriber: "Dr. Rohan Patel, MD",
  allergies: ["Penicillin", "Sulfa drugs"],
};

export const PRESCRIBERS: Record<string, Prescriber> = {
  patel:  { name: "Dr. Rohan Patel, MD",   specialty: "Internal Medicine", clinic: "Bay Family Health, San Francisco", phone: "(415) 555-0119" },
  chen:   { name: "Dr. Karen Chen, MD",    specialty: "Endocrinology",     clinic: "Pacific Diabetes Center",          phone: "(415) 555-0188" },
  okafor: { name: "Dr. Marcus Okafor, MD", specialty: "Cardiology",        clinic: "Heart Specialists Group",          phone: "(415) 555-0144" },
};

export const PRESCRIPTIONS: Prescription[] = [
  {
    id: "atorva", name: "Atorvastatin", strength: "20 mg", form: "tablet",
    sig: "Take 1 tablet by mouth once daily at bedtime",
    qtyPerFill: 30, daysSupply: 30, refillsRemaining: 3, refillsTotal: 5,
    daysLeft: 5, nextRefillDate: "May 9, 2026", lastFilled: "Apr 9, 2026",
    rxNumber: "RX48119", prescriber: "patel",
    purpose: "Lowers LDL cholesterol",
    status: "Refill available", statusTone: "success", price: 8.40,
  },
  {
    id: "lisin", name: "Lisinopril", strength: "10 mg", form: "tablet",
    sig: "Take 1 tablet by mouth once daily in the morning",
    qtyPerFill: 90, daysSupply: 90, refillsRemaining: 2, refillsTotal: 3,
    daysLeft: 18, nextRefillDate: "May 22, 2026", lastFilled: "Feb 22, 2026",
    rxNumber: "RX48077", prescriber: "patel",
    purpose: "Blood pressure (ACE inhibitor)",
    status: "Ready for pickup", statusTone: "info",
    daysSub: "Maple St. Pharmacy", price: 6.20,
  },
  {
    id: "metf", name: "Metformin", strength: "500 mg", form: "tablet",
    sig: "Take 2 tablets by mouth twice daily with meals",
    qtyPerFill: 120, daysSupply: 30, refillsRemaining: 4, refillsTotal: 5,
    daysLeft: 22, nextRefillDate: "May 26, 2026", lastFilled: "Apr 26, 2026",
    rxNumber: "RX48201", prescriber: "chen",
    purpose: "Type 2 diabetes — controls blood sugar",
    status: "Active", statusTone: "neutral", price: 11.80,
  },
  {
    id: "amlod", name: "Amlodipine", strength: "5 mg", form: "tablet",
    sig: "Take 1 tablet by mouth once daily",
    qtyPerFill: 30, daysSupply: 30, refillsRemaining: 1, refillsTotal: 5,
    daysLeft: 3, nextRefillDate: "May 7, 2026", lastFilled: "Apr 7, 2026",
    rxNumber: "RX47998", prescriber: "okafor",
    purpose: "Blood pressure (calcium channel blocker)",
    status: "Refill soon", statusTone: "warning", price: 7.50,
  },
  {
    id: "vitd-rx", name: "Vitamin D3", strength: "1000 IU", form: "softgel",
    sig: "Take 1 softgel daily with food",
    qtyPerFill: 90, daysSupply: 90, refillsRemaining: 5, refillsTotal: 12,
    daysLeft: 47, nextRefillDate: "Jun 20, 2026", lastFilled: "Mar 22, 2026",
    rxNumber: "OTC-228", prescriber: "patel",
    purpose: "Vitamin D supplementation",
    status: "Active", statusTone: "neutral", price: 5.40,
  },
];

export const MESSAGES: MessageSummary[] = [
  { id: "t1", from: "Maple St. Pharmacy", who: "pharm",   lastSnippet: "Your Lisinopril refill is ready for pickup.",       time: "10:42 AM",  unread: true  },
  { id: "t2", from: "Dr. Rohan Patel",    who: "doc",     lastSnippet: "I've sent over the new statin dose to your pharmacy.", time: "Yesterday", unread: false },
  { id: "t3", from: "Medico Support",     who: "support", lastSnippet: "We received your delivery preference update.",     time: "Apr 28",    unread: false },
];

export const THREAD_PHARM: ThreadMsg[] = [
  { from: "them", text: "Hi Margaret — your Lisinopril 10 mg refill is ready for pickup at Maple St. Pharmacy until Friday, May 8.", time: "Mon 10:38 AM" },
  { from: "them", text: "If you'd like, we can also schedule a home delivery instead. Just reply with a date and time window.",     time: "Mon 10:38 AM" },
  { from: "me",   text: "Could I get it delivered Friday afternoon instead?",                                                       time: "Mon 10:42 AM" },
  { from: "them", text: "Of course — I have you down for Friday, May 9, between 2:00 and 4:00 PM. You'll get a text when the driver is on the way.", time: "Mon 10:43 AM" },
];

