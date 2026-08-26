// Prescriptions list — current vs. past, split from real PrimeRX data.
// Current = dispensed within the last ~6 months (what the patient is on now).
// Past    = older, or filed/deferred and never dispensed.
// Running out of refills does NOT move a medication to Past — it stays current
// and its status pill says it needs a renewal.
// Both tabs get an explicit empty state; nothing here is mock.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Pill, Seg } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { PageHeader } from "@/components/Layout";
import { useApp } from "@/context";
import { selectCurrent, selectPast } from "@/lib/prescriptions";

type Filter = "active" | "past";

/** Pickup/delivery happens a day or two after the fill — show the real date. */
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function EmptyState({ icon, title, note }: { icon: IconName; title: string; note: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 8,
        padding: "48px 24px",
      }}
    >
      <span className="rx-tile" style={{ background: "var(--slate-100)", color: "var(--fg-3)" }}>
        <Icon name={icon} />
      </span>
      <div className="list-name" style={{ marginTop: 4 }}>
        {title}
      </div>
      <div className="muted" style={{ fontSize: 14, maxWidth: 340 }}>
        {note}
      </div>
    </div>
  );
}

export default function Prescriptions() {
  const nav = useNavigate();
  const { prescriptions, rxLoading } = useApp();
  const [filter, setFilter] = useState<Filter>("active");

  const active = selectCurrent(prescriptions);
  const past = selectPast(prescriptions);

  return (
    <main className="page" data-screen-label="Prescriptions">
      <PageHeader
        title="Prescriptions"
        sub="Refill, schedule delivery, and review every medication you've been prescribed."
        action={
          <Button variant="primary" leadingIcon="plus">
            Request new refill
          </Button>
        }
      />

      <div className="row-spread" style={{ marginBottom: 16 }}>
        <Seg<Filter>
          options={[
            { value: "active", label: `Current (${active.length})` },
            { value: "past", label: `Past (${past.length})` },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <div className="search-input">
          <Icon name="search" />
          <input placeholder="Search by name or prescriber" />
        </div>
      </div>

      <Card>
        {rxLoading ? (
          <EmptyState icon="refresh-cw" title="Loading your prescriptions…" note="One moment." />
        ) : filter === "active" ? (
          active.length > 0 ? (
            active.map((m) => (
              <div key={m.id} className="list-row" onClick={() => nav(`/rx/${m.id}`)}>
                <span className="rx-tile">
                  <Icon name="pill" />
                </span>
                <div className="list-main">
                  <div className="list-name">
                    {m.name} {m.strength}
                  </div>
                  <div className="list-meta">
                    {m.qtyPerFill} {m.form}s ·{" "}
                    {m.sig.replace("Take ", "").replace(" by mouth", "")} · Rx# {m.rxNumber}
                  </div>
                  {m.handoff === "ready_for_pickup" ? (
                    <div className="list-meta" style={{ marginTop: 2 }}>
                      <Icon name="package" /> Ready to collect at {"Medico Pharmacy"}
                    </div>
                  ) : m.handoff === "awaiting_delivery" ? (
                    <div className="list-meta" style={{ marginTop: 2, color: "var(--brand-700, inherit)" }}>
                      <Icon name="truck" /> Scheduled for delivery
                    </div>
                  ) : m.handoff ? (
                    <div className="list-meta" style={{ marginTop: 2 }}>
                      <Icon name={m.handoff === "delivered" ? "truck" : "check"} />{" "}
                      {m.handoff === "delivered" ? "Delivered" : "Picked up"}{" "}
                      {fmtDate(m.pickupDateIso) || m.lastFilled}
                    </div>
                  ) : null}
                </div>
                <div className="list-right">
                  <Pill tone={m.statusTone}>{m.status}</Pill>
                  <span className="caption">
                    {m.daysLeft != null
                      ? `${m.daysLeft} days left · ${m.refillsRemaining} of ${m.refillsTotal} refills`
                      : `${m.refillsRemaining} of ${m.refillsTotal} refills`}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon="pill"
              title="No active prescriptions"
              note="When your prescriber sends a prescription to Medico Pharmacy, it'll show up here."
            />
          )
        ) : past.length > 0 ? (
          past.map((m) => (
            <div key={m.id} className="list-row" onClick={() => nav(`/rx/${m.id}`)}>
              <span
                className="rx-tile"
                style={{ background: "var(--slate-100)", color: "var(--fg-3)" }}
              >
                <Icon name="check-circle" />
              </span>
              <div className="list-main">
                <div className="list-name">
                  {m.name} {m.strength}
                </div>
                <div className="list-meta">
                  {m.handoff === "awaiting_delivery"
                    ? "Scheduled for delivery"
                    : m.handoff
                      ? `${m.handoff === "delivered" ? "Delivered" : "Picked up"} ${fmtDate(m.pickupDateIso) || m.lastFilled}`
                      : `Last filled ${m.lastFilled}`}{" "}
                  · Rx# {m.rxNumber}
                </div>
              </div>
              <div className="list-right">
                <Pill tone="neutral">{m.dispensed === false ? m.status : "No refills left"}</Pill>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon="check-circle"
            title="No past prescriptions"
            note="Prescriptions you've finished or used up all refills for will appear here."
          />
        )}
      </Card>
    </main>
  );
}
