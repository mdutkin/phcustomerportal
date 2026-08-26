// Dashboard — everything here comes from the patient's real prescription data.
// Counts use the shared selectors so this screen can never disagree with the
// prescriptions list about what "current" means.

import { useNavigate } from "react-router-dom";
import { Banner, Button, Card, Pill, StatTile } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { MedicationRow } from "@/components/rows";
import { PageHeader } from "@/components/Layout";
import { useApp } from "@/context";
import {
  selectCurrent,
  selectNeedsRenewal,
  selectOutForDelivery,
  selectRecentlyReceived,
  selectRefillable,
} from "@/lib/prescriptions";

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DashboardA() {
  const nav = useNavigate();
  const { patient, prescriptions, rxLoading } = useApp();

  const current = selectCurrent(prescriptions);
  const refillable = selectRefillable(prescriptions);
  const needsRenewal = selectNeedsRenewal(prescriptions);
  const outForDelivery = selectOutForDelivery(prescriptions);
  const recent = selectRecentlyReceived(prescriptions, 3);

  const firstName = patient.name.split(" ")[0] ?? "";
  const summary = rxLoading
    ? "Loading your prescriptions…"
    : current.length === 0
      ? "No current prescriptions on file."
      : [
          `You're on <b>${current.length} medication${current.length === 1 ? "" : "s"}</b>`,
          refillable.length > 0 ? `<b>${refillable.length}</b> can be refilled` : null,
          needsRenewal.length > 0 ? `<b>${needsRenewal.length}</b> need a renewal` : null,
          outForDelivery.length > 0 ? `<b>${outForDelivery.length}</b> on the way` : null,
        ]
          .filter(Boolean)
          .join(" · ") + ".";

  return (
    <main className="page" data-screen-label="Dashboard">
      <PageHeader
        title={`Hello, ${firstName}`}
        sub={summary}
        action={
          <div className="row">
            <Button variant="secondary" leadingIcon="message-square" onClick={() => nav("/messages")}>
              Contact pharmacy
            </Button>
            <Button variant="primary" leadingIcon="plus" onClick={() => nav("/prescriptions")}>
              Request refill
            </Button>
          </div>
        }
      />

      {/* Only shown when something is genuinely on a delivery run. */}
      {outForDelivery.length > 0 ? (
        <Banner
          tone="info"
          icon="truck"
          title={`${outForDelivery.length} prescription${outForDelivery.length === 1 ? " is" : "s are"} on the way.`}
          action={
            <Button variant="secondary" size="sm" onClick={() => nav("/prescriptions")}>
              View
            </Button>
          }
        >
          {outForDelivery.map((m) => m.name).join(", ")} — we'll let you know once delivered.
        </Banner>
      ) : null}

      <div className="stat-grid">
        <StatTile
          icon="pill"
          iconTone="brand"
          label="Current medications"
          value={current.length}
          sub={`<b>${refillable.length}</b> ready to refill`}
          onClick={() => nav("/prescriptions")}
        />
        <StatTile
          icon="refresh-cw"
          iconTone={needsRenewal.length > 0 ? "warning" : "brand"}
          label="Need a renewal"
          value={needsRenewal.length}
          sub="no refills left"
          onClick={() => nav("/prescriptions")}
        />
        <StatTile
          icon="truck"
          iconTone={outForDelivery.length > 0 ? "info" : "brand"}
          label="Out for delivery"
          value={outForDelivery.length}
          sub={outForDelivery.length > 0 ? "on a delivery run" : "nothing in transit"}
          onClick={() => nav("/prescriptions")}
        />
      </div>

      <div className="cols">
        <Card
          title="Your medications"
          action={
            <button className="link" onClick={() => nav("/prescriptions")} type="button">
              View all <Icon name="arrow-right" />
            </button>
          }
        >
          {current.length > 0 ? (
            <div role="list">
              {current.slice(0, 4).map((m) => (
                <MedicationRow
                  key={m.id}
                  med={{
                    ...m,
                    displayName: `${m.name} ${m.strength}`,
                    displaySig: `${m.qtyPerFill} ${m.form}s · ${m.sig
                      .replace("Take ", "")
                      .replace(" by mouth", "")}`,
                  }}
                  onClick={() => nav(`/rx/${m.id}`)}
                />
              ))}
            </div>
          ) : (
            <div style={{ padding: 20 }} className="muted">
              {rxLoading ? "Loading…" : "Nothing on file yet."}
            </div>
          )}
        </Card>

        <div className="col-stack">
          <Card title="Recent deliveries">
            {recent.length > 0 ? (
              recent.map((m) => (
                <div key={m.id} className="list-row" onClick={() => nav(`/rx/${m.id}`)}>
                  <span
                    className="rx-tile"
                    style={{ background: "var(--slate-100)", color: "var(--fg-3)" }}
                  >
                    <Icon name={m.handoff === "delivered" ? "truck" : "check"} />
                  </span>
                  <div className="list-main">
                    <div className="list-name">
                      {m.name} {m.strength}
                    </div>
                    <div className="list-meta">
                      {m.handoff === "delivered" ? "Delivered" : "Picked up"}{" "}
                      {fmtDate(m.pickupDateIso)}
                    </div>
                  </div>
                  <div className="list-right">
                    <Pill tone="success">
                      {m.handoff === "delivered" ? "Delivered" : "Collected"}
                    </Pill>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 20 }} className="muted">
                {rxLoading ? "Loading…" : "No deliveries yet."}
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}
