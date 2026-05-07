// Dashboard layout B — hero card, quick actions, condensed lists.

import { useNavigate } from "react-router-dom";
import { Button, Card, Pill, Sparkline } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { BILLING, LAB_RESULTS } from "@/data";
import { useApp } from "@/context";

export default function DashboardB() {
  const nav = useNavigate();
  const { balance, prescriptions } = useApp();
  const readyToRefill = prescriptions.filter(
    (m) => m.statusTone === "success" || m.statusTone === "warning",
  ).length;

  return (
    <main className="page" data-screen-label="Dashboard B">
      <div className="crumbs">
        <span style={{ color: "var(--fg-1)" }}>Today, Monday, May 4</span>
      </div>

      <div className="hero-card">
        <div className="hero-eyebrow">Today's plan</div>
        <h1 className="hero-title">
          {readyToRefill} prescriptions ready to refill, 1 delivery arriving 2:00–4:00 PM.
        </h1>
        <p className="hero-sub">
          Total outstanding balance is ${balance.toFixed(2)}, due {BILLING.dueDate}.
        </p>
        <div className="hero-actions">
          <Button
            variant="primary"
            leadingIcon="pill"
            onClick={() => nav("/prescriptions")}
          >
            Refill prescriptions
          </Button>
          <Button
            variant="secondary"
            leadingIcon="credit-card"
            onClick={() => nav("/billing")}
          >
            Pay balance
          </Button>
        </div>
      </div>

      <div className="action-grid">
        <button
          className="action-tile"
          onClick={() => nav("/prescriptions")}
          type="button"
        >
          <span className="action-tile-icon">
            <Icon name="truck" />
          </span>
          <div>
            <div className="action-tile-title">Schedule delivery</div>
            <div className="action-tile-sub">Pick a date and 2-hour window</div>
          </div>
        </button>
        <button className="action-tile" onClick={() => nav("/labs")} type="button">
          <span className="action-tile-icon">
            <Icon name="flask-conical" />
          </span>
          <div>
            <div className="action-tile-title">Lab results</div>
            <div className="action-tile-sub">8 results, 2 outside range</div>
          </div>
        </button>
        <button className="action-tile" onClick={() => nav("/shop")} type="button">
          <span className="action-tile-icon">
            <Icon name="shopping-bag" />
          </span>
          <div>
            <div className="action-tile-title">Shop OTC</div>
            <div className="action-tile-sub">Pain relief, vitamins, first aid</div>
          </div>
        </button>
        <button className="action-tile" onClick={() => nav("/messages")} type="button">
          <span className="action-tile-icon">
            <Icon name="message-square" />
          </span>
          <div>
            <div className="action-tile-title">Contact pharmacy</div>
            <div className="action-tile-sub">Average reply in 12 minutes</div>
          </div>
        </button>
      </div>

      <div className="cols-1-2">
        <div className="col-stack">
          <Card title="Today's medications" sub="Take with breakfast and dinner">
            <div role="list">
              {prescriptions.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="list-row"
                  onClick={() => nav(`/rx/${m.id}`)}
                >
                  <span className="rx-tile">
                    <Icon name="pill" />
                  </span>
                  <div className="list-main">
                    <div className="list-name">
                      {m.name} {m.strength}
                    </div>
                    <div className="list-meta">
                      {m.sig.replace("Take ", "").replace(" by mouth", "")}
                    </div>
                  </div>
                  <div className="list-right">
                    <Pill tone={m.statusTone}>{m.status}</Pill>
                    <span className="caption">
                      {m.daysLeft != null
                        ? `${m.daysLeft} days left`
                        : m.daysSub}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Lab trends" sub="Last 6 readings">
            <div
              style={{
                padding: 16,
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
              }}
            >
              {LAB_RESULTS.slice(0, 4).map((l) => (
                <div
                  key={l.id}
                  onClick={() => nav(`/lab/${l.id}`)}
                  style={{
                    cursor: "pointer",
                    padding: 14,
                    borderRadius: 10,
                    border: "1px solid var(--slate-200)",
                  }}
                >
                  <div className="row-spread" style={{ marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--fg-1)",
                      }}
                    >
                      {l.name}
                    </span>
                    <span
                      className={`flag flag-${l.flag === "H" ? "h" : l.flag === "L" ? "l" : "ok"}`}
                    >
                      {l.flag === "OK" ? "OK" : l.flag === "H" ? "HIGH" : "LOW"}
                    </span>
                  </div>
                  <div className="row-spread" style={{ alignItems: "baseline" }}>
                    <span>
                      <span
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: "var(--fg-1)",
                        }}
                        className="tabular"
                      >
                        {l.value}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--fg-3)" }}>
                        {" "}
                        {l.unit}
                      </span>
                    </span>
                    <Sparkline values={l.history} width={110} height={32} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-stack">
          <Card title="Next delivery">
            <div
              style={{
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div className="row" style={{ gap: 14 }}>
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: "var(--brand-tint)",
                    color: "var(--brand-primary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 48px",
                  }}
                >
                  <Icon name="truck" />
                </span>
                <div>
                  <div
                    style={{ fontSize: 15, fontWeight: 600, color: "var(--fg-1)" }}
                  >
                    Today, May 4
                  </div>
                  <div style={{ fontSize: 13, color: "var(--fg-3)" }}>
                    2:00 – 4:00 PM · Maria T. is your driver
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  background: "var(--slate-50)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--fg-2)",
                }}
              >
                <b>Atorvastatin 20 mg</b> · 30 tablets
              </div>
              <Pill tone="info" icon="package">
                Out for delivery
              </Pill>
              <Button variant="secondary" leadingIcon="map-pin" block>
                Track on map
              </Button>
            </div>
          </Card>

          <Card title="Outstanding balance">
            <div
              style={{
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--fg-3)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Total due
                </div>
                <div
                  className="tabular"
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "var(--fg-1)",
                    marginTop: 4,
                  }}
                >
                  ${balance.toFixed(2)}
                </div>
                <div style={{ fontSize: 13, color: "var(--fg-3)" }}>
                  Due {BILLING.dueDate}
                </div>
              </div>
              <Button
                variant="primary"
                block
                leadingIcon="credit-card"
                onClick={() => nav("/billing")}
              >
                Pay now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                block
                onClick={() => nav("/billing")}
              >
                See itemized statement
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
