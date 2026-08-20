// Wire types — mirror phcustomerapi's response shapes exactly.
// Keep in sync with:
//   modules/patients/patients.service.ts   (MeResult)
//   modules/prescriptions/prescriptions.service.ts (RxListItem, RxDetail)
//   modules/requests/requests.service.ts   (CommandView)

export type DbKind = "340b" | "conventional";

export interface ApiPatient {
  patientno: number;
  lastName: string | null;
  firstName: string | null;
  middleInitial: string | null;
  dob: string | null;
  sex: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  allergies: string | null;
  primaryInsurance: string | null;
  primaryGroupNo: string | null;
  primaryMemberNo: string | null;
}

export interface Me {
  user: { id: string; email: string | null; phoneE164: string | null };
  link: { dbKind: DbKind; patientno: number; isPrimary: boolean } | null;
  patient: ApiPatient | null;
  addresses: Array<{
    id: string;
    label: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
  }>;
}

export interface ApiRx {
  rxno: string;
  dbKind: DbKind;
  drugName: string | null;
  drugStrength: string | null;
  drugForm: string | null;
  ndc: string | null;
  sig: string | null;
  daysSupply: number | null;
  qtyOrdered: number | null;
  refillsRemaining: number;
  refillsTotal: number;
  status: string | null;
  lastFilledAt: string | null;
  pickedUp: boolean;
  pickupDate: string | null;
  /** How it reached the patient: delivered, collected in store, or not yet. */
  handoff: "delivered" | "picked_up" | null;
  pickupTime: string | null;
  /** False when PrimeRX filed/deferred it instead of dispensing. */
  dispensed: boolean;
  filedReason: string | null;
  is340b: boolean;
}

export interface ApiRxDetail {
  rx: ApiRx;
  delivery: {
    address: string | null;
    instructions: string | null;
    requestedDate: string | null;
    deliveredDate: string | null;
    driver: string | null;
    trackingNo: string | null;
  } | null;
  prescriber: {
    presno: number;
    firstName: string | null;
    lastName: string | null;
    npi: string | null;
    phone: string | null;
    fax: string | null;
    email: string | null;
  } | null;
  history: Array<{
    refillNo: number;
    filledAt: string | null;
    qtyDispensed: number | null;
    pickedUp: boolean;
    pickupDate: string | null;
    handoff: "delivered" | "picked_up" | null;
    pickupTime: string | null;
    dispensed: boolean;
    filedReason: string | null;
  }>;
  pendingRefillRequest: { id: string; status: string; requestedAt: string } | null;
}

export type CommandType = "refill_request" | "update_details" | "update_delivery";
export type CommandStatus =
  | "pending"
  | "in_progress"
  | "done"
  | "rejected"
  | "canceled"
  | "failed";

export interface ApiRequest {
  id: string;
  type: CommandType;
  status: CommandStatus;
  payload: Record<string, unknown>;
  patientNote: string | null;
  staffNote: string | null;
  requestedAt: string;
  completedAt: string | null;
}
