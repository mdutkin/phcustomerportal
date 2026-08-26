// MedicationRow — list-item primitive.

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

