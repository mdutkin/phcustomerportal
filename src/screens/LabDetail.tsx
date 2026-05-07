// Lab detail — value + sparkline, provider note, trend table, "what this means".

import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Pill, Sparkline } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/Layout";
import { LAB_RESULTS, PRESCRIPTIONS } from "@/data";

export default function LabDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const nav = useNavigate();
  const lab = LAB_RESULTS.find((l) => l.id === id);

  if (!lab) {
    return (
      <main className="page">
        <PageHeader
          title="Lab not found"
          crumbs={[{ label: "Lab results", to: "/labs" }]}
        />
      </main>
    );
  }

  const flagTone =
    lab.flag === "OK" ? "success" : lab.flag === "H" ? "warning" : "info";
  const flagLabel =
    lab.flag === "OK" ? "In range" : lab.flag === "H" ? "Above range" : "Below range";

  const meanings: Record<string, string> = {
    tchol:
      "Total cholesterol measures all the cholesterol in your blood. Levels under 200 mg/dL are considered desirable. Values can be influenced by diet, activity, and medication.",
    hdl: "HDL is 'good' cholesterol — it carries cholesterol away from arteries. Higher is better; ≥40 mg/dL for men, ≥50 mg/dL for women.",
    ldl: "LDL is 'bad' cholesterol that can build up in artery walls. Lower is better. Your statin therapy is working to bring this down.",
    a1c: "A1c reflects your average blood sugar over the past 2–3 months. Below 6.5% indicates well-controlled diabetes.",
    vitd: "Vitamin D supports bone health and immune function. Below 30 ng/mL is considered insufficient. Continue your D3 supplement.",
  };

  const dates = [
    "Oct 12, 2024",
    "Apr 8, 2025",
    "Oct 24, 2025",
    "Jan 15, 2026",
    "Mar 8, 2026",
    "Apr 24, 2026",
  ];

  return (
    <main className="page" data-screen-label="Lab detail">
      <PageHeader
        crumbs={[{ label: "Lab results", to: "/labs" }, { label: lab.name }]}
        title={lab.name}
        sub={`<b>${lab.category}.</b> Drawn ${lab.when} at ${lab.source}.`}
        action={
          <Button
            variant="secondary"
            leadingIcon="message-square"
            onClick={() => nav("/messages")}
          >
            Ask your provider
          </Button>
        }
      />

      <div className="detail-grid">
        <div className="col-stack">
          <Card title="Latest result">
            <div
              style={{
                padding: 24,
                display: "flex",
                alignItems: "flex-end",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span
                    className="tabular"
                    style={{
                      fontSize: 56,
                      fontWeight: 700,
                      color: "var(--fg-1)",
                      lineHeight: 1,
                    }}
                  >
                    {lab.value}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      color: "var(--fg-3)",
                      fontWeight: 500,
                    }}
                  >
                    {lab.unit}
                  </span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Pill tone={flagTone}>{flagLabel}</Pill>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--fg-3)",
                    marginTop: 12,
                  }}
                >
                  Reference range:{" "}
                  <b style={{ color: "var(--fg-1)" }}>
                    {lab.range} {lab.unit}
                  </b>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--fg-3)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Last 6 readings
                </div>
                <Sparkline values={lab.history} width={320} height={80} />
                <div
                  className="row-spread"
                  style={{ marginTop: 8, fontSize: 12, color: "var(--fg-3)" }}
                >
                  <span>Oct '24</span>
                  <span>Apr '26</span>
                </div>
              </div>
            </div>
          </Card>

          {lab.note && (
            <Card title="Provider note">
              <div
                style={{
                  padding: 20,
                  fontSize: 14,
                  color: "var(--fg-2)",
                  lineHeight: 1.6,
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--fg-1)" }}>
                  Dr. Rohan Patel — Apr 26:
                </span>{" "}
                {lab.note}
              </div>
            </Card>
          )}

          <Card title="Trend over time">
            <div style={{ padding: 20 }}>
              <table
                style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 0",
                        color: "var(--fg-3)",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "8px 0",
                        color: "var(--fg-3)",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Value
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "8px 0",
                        color: "var(--fg-3)",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dates.map((d, i) => (
                    <tr key={i} style={{ borderTop: "1px solid var(--slate-100)" }}>
                      <td style={{ padding: "10px 0", color: "var(--fg-1)" }}>{d}</td>
                      <td
                        className="tabular"
                        style={{
                          padding: "10px 0",
                          textAlign: "right",
                          color: "var(--fg-1)",
                          fontWeight: 600,
                        }}
                      >
                        {lab.history[i]} {lab.unit}
                      </td>
                      <td style={{ padding: "10px 0", textAlign: "right" }}>
                        <Pill
                          tone={i === lab.history.length - 1 ? flagTone : "neutral"}
                        >
                          {i === lab.history.length - 1 ? flagLabel : "Recorded"}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="col-stack">
          <Card title="What this means">
            <div
              style={{
                padding: 20,
                fontSize: 14,
                color: "var(--fg-2)",
                lineHeight: 1.6,
              }}
            >
              {meanings[lab.id] ??
                "Within normal range. Your provider will continue to monitor at your routine visits."}
            </div>
          </Card>

          <Card title="Related medications">
            {PRESCRIPTIONS.slice(0, 2).map((m) => (
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
                  <div className="list-meta">{m.purpose}</div>
                </div>
                <Icon name="chevron-right" style={{ color: "var(--fg-3)" }} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </main>
  );
}
