// Prescriptions list — active vs. past, with search input.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Pill, Seg } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/Layout";
import { PAST_PRESCRIPTIONS, PRESCRIBERS } from "@/data";
import { useApp } from "@/context";

type Filter = "active" | "past";

export default function Prescriptions() {
  const nav = useNavigate();
  const { prescriptions } = useApp();
  const [filter, setFilter] = useState<Filter>("active");

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
            { value: "active", label: `Active (${prescriptions.length})` },
            { value: "past", label: `Past (${PAST_PRESCRIPTIONS.length})` },
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
        {filter === "active"
          ? prescriptions.map((m) => (
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
                    {m.qtyPerFill} {m.form}s ·{" "}
                    {m.sig.replace("Take ", "").replace(" by mouth", "")} ·{" "}
                    <b>{PRESCRIBERS[m.prescriber].name.replace(", MD", "")}</b> · Rx#{" "}
                    {m.rxNumber}
                  </div>
                </div>
                <div className="list-right">
                  <Pill tone={m.statusTone}>{m.status}</Pill>
                  <span className="caption">
                    {m.daysLeft != null
                      ? `${m.daysLeft} days left · ${m.refillsRemaining} of ${m.refillsTotal} refills`
                      : m.daysSub}
                  </span>
                </div>
              </div>
            ))
          : PAST_PRESCRIPTIONS.map((m, i) => (
              <div key={i} className="list-row" style={{ cursor: "default" }}>
                <span
                  className="rx-tile"
                  style={{ background: "var(--slate-100)", color: "var(--fg-3)" }}
                >
                  <Icon name="check-circle" />
                </span>
                <div className="list-main">
                  <div className="list-name">{m.name}</div>
                  <div className="list-meta">
                    Filled {m.filled} · {m.reason} ·{" "}
                    {PRESCRIBERS[m.prescriber].name.replace(", MD", "")}
                  </div>
                </div>
                <div className="list-right">
                  <Pill tone="neutral">Completed</Pill>
                </div>
              </div>
            ))}
      </Card>
    </main>
  );
}
