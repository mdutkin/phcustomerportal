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

export interface PastPrescription {
  name: string;
  filled: string;
  reason: string;
  prescriber: string;
}

export interface LabResult {
  id: string;
  name: string;
  category: string;
  when: string;
  source: string;
  value: number;
  unit: string;
  flag: Flag;
  range: string;
  refLow?: number;
  refHigh?: number;
  history: number[];
  note?: string;
}

export interface OtcProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  pack: string;
  price: number;
  rating: number;
  icon: string;
  sale: boolean;
}

export interface CartItem extends OtcProduct {
  qty: number;
}

export interface Delivery {
  id: string;
  date: string;
  when: string;
  time: string;
  items: string;
  status: string;
  statusTone: StatusTone;
  dot: "filled" | "muted" | "open";
  driver?: string;
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

export interface BillingItem {
  id: string;
  date: string;
  desc: string;
  amount: number;
  status: "Paid" | "Outstanding";
}

export interface Billing {
  total: number;
  outstanding: number;
  dueDate: string;
  card: { brand: string; last4: string; exp: string };
  recent: BillingItem[];
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

export const PAST_PRESCRIPTIONS: PastPrescription[] = [
  { name: "Amoxicillin 500 mg", filled: "Jan 18, 2026", reason: "Sinus infection (10 days)",     prescriber: "patel" },
  { name: "Prednisone 10 mg",   filled: "Nov 4, 2025",  reason: "Allergic reaction (5 days taper)", prescriber: "patel" },
  { name: "Atorvastatin 10 mg", filled: "Aug 12, 2024", reason: "Replaced by 20 mg dose",         prescriber: "patel" },
];

export const LAB_RESULTS: LabResult[] = [
  {
    id: "tchol", name: "Total cholesterol", category: "Lipid panel",
    when: "Apr 24, 2026", source: "Quest Diagnostics",
    value: 215, unit: "mg/dL", flag: "H",
    range: "< 200", refLow: 0, refHigh: 200,
    history: [228, 231, 224, 220, 218, 215],
    note: "Slightly above target. Recheck in 3 months after dose adjustment.",
  },
  {
    id: "hdl", name: "HDL cholesterol", category: "Lipid panel",
    when: "Apr 24, 2026", source: "Quest Diagnostics",
    value: 58, unit: "mg/dL", flag: "OK",
    range: "≥ 40",
    history: [52, 54, 55, 56, 57, 58],
    note: "Healthy level.",
  },
  {
    id: "ldl", name: "LDL cholesterol", category: "Lipid panel",
    when: "Apr 24, 2026", source: "Quest Diagnostics",
    value: 132, unit: "mg/dL", flag: "H",
    range: "< 100",
    history: [148, 144, 140, 136, 134, 132],
    note: "Trending down. Continue current statin therapy.",
  },
  {
    id: "a1c", name: "Hemoglobin A1c", category: "Diabetes",
    when: "Apr 24, 2026", source: "Quest Diagnostics",
    value: 5.9, unit: "%", flag: "OK",
    range: "< 6.5",
    history: [6.4, 6.2, 6.1, 6.0, 5.9, 5.9],
    note: "Excellent diabetes control. Keep it up.",
  },
  {
    id: "fbg", name: "Fasting glucose", category: "Diabetes",
    when: "Apr 24, 2026", source: "Quest Diagnostics",
    value: 108, unit: "mg/dL", flag: "OK",
    range: "70–110",
    history: [118, 115, 112, 110, 109, 108],
  },
  {
    id: "vitd", name: "Vitamin D, 25-OH", category: "Vitamins",
    when: "Apr 24, 2026", source: "Quest Diagnostics",
    value: 22, unit: "ng/mL", flag: "L",
    range: "30–100",
    history: [18, 19, 20, 21, 22, 22],
    note: "Below range. Continue supplementation.",
  },
  {
    id: "tsh", name: "TSH", category: "Thyroid",
    when: "Mar 12, 2026", source: "LabCorp",
    value: 2.1, unit: "μIU/mL", flag: "OK",
    range: "0.4–4.5",
    history: [2.4, 2.3, 2.2, 2.2, 2.1, 2.1],
  },
  {
    id: "egfr", name: "eGFR (kidney function)", category: "Metabolic",
    when: "Apr 24, 2026", source: "Quest Diagnostics",
    value: 76, unit: "mL/min", flag: "OK",
    range: "≥ 60",
    history: [72, 74, 75, 76, 76, 76],
  },
];

export const OTC_PRODUCTS: OtcProduct[] = [
  { id: "tylenol",    name: "Acetaminophen 500 mg",       brand: "Tylenol Extra Strength", category: "Pain & Fever",  pack: "100 caplets", price: 12.99, rating: 4.7, icon: "pill",        sale: false },
  { id: "advil",      name: "Ibuprofen 200 mg",           brand: "Advil",                  category: "Pain & Fever",  pack: "200 tablets", price: 14.49, rating: 4.6, icon: "pill",        sale: true  },
  { id: "claritin",   name: "Loratadine 10 mg",           brand: "Claritin 24 Hour",       category: "Allergy",       pack: "30 tablets",  price: 18.99, rating: 4.5, icon: "leaf",        sale: false },
  { id: "zyrtec",     name: "Cetirizine 10 mg",           brand: "Zyrtec",                 category: "Allergy",       pack: "30 tablets",  price: 16.49, rating: 4.4, icon: "leaf",        sale: false },
  { id: "robitussin", name: "Cough syrup, DM",            brand: "Robitussin",             category: "Cold & Flu",    pack: "8 fl oz",     price: 9.79,  rating: 4.3, icon: "thermometer", sale: false },
  { id: "vitc",       name: "Vitamin C 500 mg",           brand: "Nature's Best",          category: "Vitamins",      pack: "120 tablets", price: 11.99, rating: 4.6, icon: "citrus",      sale: false },
  { id: "magnesium",  name: "Magnesium glycinate 200 mg", brand: "Pure Element",           category: "Vitamins",      pack: "60 capsules", price: 14.99, rating: 4.7, icon: "sparkles",    sale: false },
  { id: "bandaid",    name: "Adhesive bandages, assorted",brand: "Band-Aid",               category: "First Aid",     pack: "60 ct",       price: 5.49,  rating: 4.8, icon: "bandage",     sale: false },
  { id: "thermo",     name: "Digital thermometer",        brand: "Vicks ComfortFlex",      category: "First Aid",     pack: "1 unit",      price: 13.49, rating: 4.5, icon: "thermometer", sale: false },
  { id: "pillbox",    name: "7-day pill organizer",       brand: "Medico Care",            category: "Daily Living",  pack: "AM + PM",     price: 7.99,  rating: 4.9, icon: "package",     sale: true  },
  { id: "bpcuff",     name: "Upper arm BP monitor",       brand: "Omron Silver",           category: "Daily Living",  pack: "1 unit",      price: 64.99, rating: 4.6, icon: "activity",    sale: false },
  { id: "glucose",    name: "Blood glucose test strips",  brand: "OneTouch Verio",         category: "Diabetes care", pack: "100 strips",  price: 38.99, rating: 4.7, icon: "droplet",     sale: false },
];

export const DELIVERIES: Delivery[] = [
  { id: "d1", date: "Today, May 4", when: "Today",     time: "2:00 – 4:00 PM",     items: "Atorvastatin 20 mg · 1 item",          status: "Out for delivery", statusTone: "info",    dot: "filled", driver: "Maria T." },
  { id: "d2", date: "Fri, May 9",   when: "Fri, May 9", time: "Standard window",   items: "Lisinopril 10 mg · 1 item",            status: "Scheduled",        statusTone: "neutral", dot: "muted" },
  { id: "d3", date: "Mon, May 12",  when: "Mon, May 12",time: "Standard window",   items: "Metformin 500 mg · 2 items",           status: "Scheduled",        statusTone: "neutral", dot: "muted" },
  { id: "d4", date: "Apr 26, 2026", when: "Apr 26",    time: "Delivered 3:14 PM", items: "Metformin 500 mg",                     status: "Delivered",        statusTone: "success", dot: "filled" },
  { id: "d5", date: "Apr 7, 2026",  when: "Apr 7",     time: "Delivered 10:42 AM",items: "Amlodipine 5 mg · Atorvastatin 20 mg", status: "Delivered",        statusTone: "success", dot: "filled" },
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

export const BILLING: Billing = {
  total: 47.20,
  outstanding: 47.20,
  dueDate: "May 18, 2026",
  card: { brand: "Visa", last4: "4242", exp: "08/28" },
  recent: [
    { id: "i1", date: "Apr 26, 2026", desc: "Metformin 500 mg refill",     amount: 11.80, status: "Paid"        },
    { id: "i2", date: "Apr 24, 2026", desc: "Lab work — lipid + A1c panel",amount: 28.00, status: "Outstanding" },
    { id: "i3", date: "Apr 24, 2026", desc: "Office copay — Dr. Patel",    amount: 19.20, status: "Outstanding" },
    { id: "i4", date: "Apr 9, 2026",  desc: "Atorvastatin 20 mg refill",   amount: 8.40,  status: "Paid"        },
    { id: "i5", date: "Apr 7, 2026",  desc: "Amlodipine 5 mg refill",      amount: 7.50,  status: "Paid"        },
  ],
};
