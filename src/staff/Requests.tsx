// Staff → Requests: the command queue. Everything a patient asked the
// pharmacy to do through the portal (refills today; details/delivery changes,
// consents and agent outcomes later). A pharmacist claims it, performs it in
// PrimeRX by hand, and marks it done or rejects it with a reason the patient
// will see. We never write to PrimeRX ourselves.

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { useApp } from "@/context";
import { ApiError, listStaffRequests, transitionRequest } from "@/lib/api";
import type { StaffCommand } from "@/lib/types";
import { fmtDate } from "@/lib/dates";

const TYPE_LABEL: Record<StaffCommand["type"], string> = {
  refill_request: "Refill",
  update_details: "Update details",
  update_delivery: "Change delivery",
};
const STATUS_CLASS: Record<StaffCommand["status"], string> = {
  pending: "wl-tag-warn",
  in_progress: "wl-tag-info",
  done: "wl-tag-ok",
  rejected: "wl-tag-danger",
  canceled: "",
  failed: "wl-tag-danger",
};

function when(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${fmtDate(iso)} ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function Summary({ c }: { c: StaffCommand }) {
  if (c.type === "refill_request") {
    const p = c.payload as { rxno?: string; drugName?: string | null };
    return (
      <>
        <b>Rx {p.rxno ?? "?"}</b>
        {p.drugName ? ` · ${p.drugName}` : ""}
      </>
    );
  }
  return <code style={{ fontSize: 12 }}>{JSON.stringify(c.payload)}</code>;
}

function Row({ c, me, onChange }: { c: StaffCommand; me: string; onChange: () => void }) {
  const { pushToast } = useApp();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const open = c.status === "pending" || c.status === "in_progress";
  const mine = c.claimedBy === me;

  const act = async (action: "claim" | "release" | "done" | "reject") => {
    if (busy) return;
    if (action === "reject" && !note.trim()) {
      pushToast("Give a reason — the patient will see it.");
      return;
    }
    setBusy(true);
    try {
      await transitionRequest(c.id, action, note.trim() || undefined);
      setNote("");
      onChange();
    } catch (e) {
      pushToast((e as ApiError).message || "Couldn't update the request.");
    } finally {
      setBusy(false);
    }
  };

  const name = c.patient ? [c.patient.lastName, c.patient.firstName].filter(Boolean).join(", ") : `#${c.patientno}`;
  return (
    <tr className={`rq-row rq-${c.status}`}>
      <td>
        <span className={`wl-tag ${STATUS_CLASS[c.status]}`}>{c.status.replace("_", " ")}</span>
        <div className="muted wl-sub">{TYPE_LABEL[c.type]}</div>
      </td>
      <td className="wl-name">
        {name}
        <div className="muted wl-sub">
          {c.dbKind === "340b" ? "340B" : "CONV"} #{c.patientno}
          {c.patient?.dob ? ` · DOB ${fmtDate(c.patient.dob)}` : ""}
          {c.patient?.mobile ? ` · ${c.patient.mobile}` : ""}
        </div>
      </td>
      <td>
        <Summary c={c} />
        {c.patientNote ? <div className="rq-note">“{c.patientNote}”</div> : null}
      </td>
      <td>
        {when(c.requestedAt)}
        <div className="muted wl-sub">via portal · {c.requestedBy.phoneE164 ?? c.requestedBy.email ?? "?"}</div>
      </td>
      <td>
        {c.status === "in_progress" ? <div className="muted wl-sub">claimed by {c.claimedBy} · {when(c.claimedAt)}</div> : null}
        {c.completedAt ? <div className="muted wl-sub">{c.status} by {c.completedBy ?? "patient"} · {when(c.completedAt)}</div> : null}
        {c.staffNote ? <div className="rq-note">{c.staffNote}</div> : null}
      </td>
      <td className="staff-actions rq-actions">
        {open ? (
          <>
            {c.status === "pending" ? <Button size="sm" variant="secondary" disabled={busy} onClick={() => void act("claim")}>Claim</Button> : null}
            {c.status === "in_progress" && mine ? <Button size="sm" variant="ghost" disabled={busy} onClick={() => void act("release")}>Release</Button> : null}
            <input className="input rq-input" placeholder="note / reason" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button size="sm" variant="primary" disabled={busy} onClick={() => void act("done")}>Done in PrimeRX</Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => void act("reject")}>Reject</Button>
          </>
        ) : null}
      </td>
    </tr>
  );
}

export default function Requests() {
  const { firebaseUser, pushToast } = useApp();
  const toast = useRef(pushToast);
  toast.current = pushToast;
  const [scope, setScope] = useState<"open" | "closed" | "all">("open");
  const [items, setItems] = useState<StaffCommand[] | null>(null);
  const load = useCallback(async () => {
    try {
      setItems(await listStaffRequests(scope));
    } catch (e) {
      toast.current((e as Error).message || "Couldn't load requests.");
    }
  }, [scope]);
  useEffect(() => { void load(); }, [load]);
  const me = firebaseUser?.email ?? firebaseUser?.uid ?? "";

  return (
    <div className="staff-page">
      <div className="row-spread">
        <div>
          <h1 className="staff-h1">Requests</h1>
          <p className="muted">What patients asked for through the portal. Claim it, do it in PrimeRX, mark it done — or reject with a reason they'll see.</p>
        </div>
        <div className="wl-filters" style={{ margin: 0 }}>
          <label>Show
            <select className="input" value={scope} onChange={(e) => setScope(e.target.value as typeof scope)}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="all">All</option>
            </select>
          </label>
        </div>
      </div>
      <table className="staff-table rq-table">
        <thead>
          <tr><th>Status</th><th>Patient</th><th>Request</th><th>Requested</th><th>Handling</th><th /></tr>
        </thead>
        <tbody>
          {items === null ? (
            <tr><td colSpan={6} className="muted">Loading…</td></tr>
          ) : items.length === 0 ? (
            <tr><td colSpan={6} className="muted">Nothing {scope === "open" ? "waiting" : "here"}.</td></tr>
          ) : (
            items.map((c) => <Row key={c.id} c={c} me={me} onChange={() => void load()} />)
          )}
        </tbody>
      </table>
    </div>
  );
}
