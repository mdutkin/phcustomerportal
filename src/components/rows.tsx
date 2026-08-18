// MedicationRow, DeliveryItem — list-item primitives.

import type { Prescription, StatusTone } from "@/data";
import { Icon } from "./Icon";
import { Pill, type PillTone } from "./ui";

interface DisplayMed extends Omit<Prescription, "statusTone"> {
  statusTone: StatusTone;
  // Optional override fields if a screen wants to render combined name/sig.
  displayName?: string;
  displaySig?: string;
}

interface MedicationRowProps {
  med: DisplayMed;
  onClick?: () => void;
}

export function MedicationRow({ med, onClick }: MedicationRowProps) {
  return (
    <div className="list-row" role="listitem" onClick={onClick}>
      <span className="rx-tile"><Icon name="pill" /></span>
      <div className="list-main">
        <div className="list-name">{med.displayName ?? med.name}</div>
        <div className="list-meta">{med.displaySig ?? med.sig}</div>
      </div>
      <div className="list-right">
        <Pill tone={med.statusTone as PillTone}>{med.status}</Pill>
        <span className="caption">
          {med.daysLeft != null ? `${med.daysLeft} days left` : med.daysSub}
        </span>
      </div>
    </div>
  );
}

// ────────────── Delivery item

interface DeliveryItemProps {
  when: string;
  items: string;
  time: string;
  status: string;
  statusTone: StatusTone;
  dotState?: "filled" | "muted" | "open";
}

export function DeliveryItem({ when, items, time, status, statusTone, dotState = "filled" }: DeliveryItemProps) {
  return (
    <div className="delivery">
      <div className="timeline">
        <span
          className={`timeline-dot ${dotState === "filled" ? "filled" : dotState === "muted" ? "muted" : ""}`}
        />
        <span className="timeline-line" />
      </div>
      <div className="delivery-main">
        <div className="delivery-row1">
          <span className="delivery-when">{when}</span>
          <span className="delivery-time">{time}</span>
        </div>
        <div className="delivery-items">{items}</div>
        <div className="delivery-status">
          <Pill tone={statusTone as PillTone}>{status}</Pill>
        </div>
      </div>
    </div>
  );
}
