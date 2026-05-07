// Drug info — at a glance, how to take, side effects, when to call doctor.

import { useNavigate, useParams } from "react-router-dom";
import { Banner, Button, Card } from "@/components/ui";
import { PageHeader } from "@/components/Layout";
import { useApp } from "@/context";

export default function DrugInfo() {
  const { id = "" } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { prescriptions } = useApp();
  const med = prescriptions.find((m) => m.id === id);

  if (!med) {
    return (
      <main className="page">
        <PageHeader
          title="Drug not found"
          crumbs={[{ label: "Prescriptions", to: "/prescriptions" }]}
        />
      </main>
    );
  }

  return (
    <main className="page" data-screen-label="Drug info">
      <PageHeader
        crumbs={[
          { label: "Prescriptions", to: "/prescriptions" },
          { label: med.name, to: `/rx/${med.id}` },
          { label: "About this drug" },
        ]}
        title={`About ${med.name}`}
        sub={`Generic for cholesterol-lowering statin medications. <b>${med.purpose}.</b>`}
      />

      <div className="detail-grid">
        <div className="col-stack">
          <Card title="At a glance">
            <div style={{ padding: 20 }}>
              <div className="drug-fact-grid">
                <div className="drug-fact">
                  <div className="k">Generic name</div>
                  <div className="v">{med.name.toLowerCase()}</div>
                </div>
                <div className="drug-fact">
                  <div className="k">Drug class</div>
                  <div className="v">Statin</div>
                </div>
                <div className="drug-fact">
                  <div className="k">How it works</div>
                  <div className="v">Reduces LDL production</div>
                </div>
                <div className="drug-fact">
                  <div className="k">Onset</div>
                  <div className="v">2–4 weeks</div>
                </div>
                <div className="drug-fact">
                  <div className="k">Take with food?</div>
                  <div className="v">Optional</div>
                </div>
                <div className="drug-fact">
                  <div className="k">Storage</div>
                  <div className="v">Room temp, dry</div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="How to take it">
            <div style={{ padding: 20 }}>
              <ul className="bullet-list">
                <li>
                  Take 1 tablet by mouth at the same time each day, ideally at bedtime.
                </li>
                <li>Swallow whole with water. Do not crush or chew.</li>
                <li>
                  If you miss a dose by less than 12 hours, take it as soon as you
                  remember. Otherwise skip — do not double up.
                </li>
                <li>
                  Continue taking even if you feel well. {med.name} works best when
                  taken consistently.
                </li>
              </ul>
            </div>
          </Card>

          <Card title="Common side effects">
            <div
              style={{
                padding: 20,
                fontSize: 14,
                color: "var(--fg-2)",
                lineHeight: 1.6,
              }}
            >
              <p style={{ marginTop: 0 }}>
                Most people tolerate {med.name} well. The most common side effects are
                mild and usually go away within a few weeks:
              </p>
              <ul className="bullet-list">
                <li>Muscle aches or weakness (most common)</li>
                <li>Headache</li>
                <li>Mild stomach upset, nausea, or constipation</li>
                <li>Trouble sleeping</li>
              </ul>
              <p style={{ marginBottom: 0 }} className="muted">
                Contact Dr. Patel if side effects persist beyond 4 weeks or interfere
                with your daily activities.
              </p>
            </div>
          </Card>

          <Card title="When to call your doctor">
            <div style={{ padding: 20 }}>
              <Banner
                tone="warning"
                icon="alert-triangle"
                title="Call right away"
              >
                Severe muscle pain or weakness, dark-colored urine, yellowing of skin
                or eyes, unexplained fever, or severe stomach pain.
              </Banner>
              <p
                className="muted"
                style={{ fontSize: 14, marginTop: 12, marginBottom: 0 }}
              >
                In an emergency, call 911. For after-hours questions, the Bay Family
                Health nurse line is (415) 555-2400.
              </p>
            </div>
          </Card>
        </div>

        <div className="col-stack">
          <Card title="Interactions to watch">
            <div style={{ padding: 20, fontSize: 14, color: "var(--fg-2)" }}>
              <ul className="bullet-list">
                <li>
                  <b>Grapefruit juice</b> — can increase {med.name} levels in your
                  blood. Limit to 8 oz/day.
                </li>
                <li>
                  <b>Certain antibiotics</b> (clarithromycin, erythromycin) — may
                  increase risk of muscle problems.
                </li>
                <li>
                  <b>Warfarin</b> — may need INR monitoring.
                </li>
                <li>
                  <b>Alcohol</b> — limit to 1–2 drinks/day to protect your liver.
                </li>
              </ul>
            </div>
          </Card>
          <Card title="Your prescription">
            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 14, color: "var(--fg-1)", fontWeight: 600 }}>
                {med.name} {med.strength} · {med.form}
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-3)" }}>{med.sig}</div>
              <Button
                variant="secondary"
                leadingIcon="arrow-left"
                block
                onClick={() => nav(`/rx/${med.id}`)}
              >
                Back to prescription
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
