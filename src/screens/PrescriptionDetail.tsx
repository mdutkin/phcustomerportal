// Prescription detail — supply, prescriber, fill history, refill+delivery actions.

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Field, MiniCalendar, Modal, Pill } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/Layout";
import {
  PATIENT,
  PRESCRIBERS,
  TODAY,
  type Prescription,
} from "@/data";
import { useApp } from "@/context";

export default function PrescriptionDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { prescriptions, refillRx, pushToast } = useApp();
  const med = prescriptions.find((m) => m.id === id);

  const [refilling, setRefilling] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  if (!med) {
    return (
      <main className="page">
        <PageHeader
          title="Prescription not found"
          crumbs={[{ label: "Prescriptions", to: "/prescriptions" }]}
        />
      </main>
    );
  }

  const prescriber = PRESCRIBERS[med.prescriber];

  const onSchedule = (date: Date, win: string) => {
    pushToast(
      `Delivery scheduled for ${date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })} (${win}).`,
    );
  };

  return (
    <main className="page" data-screen-label="Prescription detail">
      <PageHeader
        crumbs={[
          { label: "Prescriptions", to: "/prescriptions" },
          { label: `${med.name} ${med.strength}` },
        ]}
        title={`${med.name} ${med.strength}`}
        sub={`<b>${med.purpose}.</b> ${med.sig}.`}
        action={
          <div className="row">
            <Button
              variant="secondary"
              leadingIcon="info"
              onClick={() => nav(`/drug/${med.id}`)}
            >
              About this drug
            </Button>
            <Button
              variant="primary"
              leadingIcon="refresh-cw"
              onClick={() => setRefilling(true)}
            >
              Request refill
            </Button>
          </div>
        }
      />

      <div className="detail-grid">
        <div className="col-stack">
          <Card title="Status & supply">
            <div style={{ padding: 20 }}>
              <div className="stat-grid" style={{ marginBottom: 0 }}>
                <Stat label="Days left" value={med.daysLeft ?? "—"} sub={<>Next refill: <b style={{ color: "var(--fg-1)" }}>{med.nextRefillDate}</b></>} />
                <Stat
                  label="Refills remaining"
                  value={
                    <>
                      {med.refillsRemaining}
                      <span style={{ fontSize: 16, color: "var(--fg-3)", fontWeight: 500 }}>
                        {" "}
                        / {med.refillsTotal}
                      </span>
                    </>
                  }
                  sub={<>Last filled: <b style={{ color: "var(--fg-1)" }}>{med.lastFilled}</b></>}
                />
                <Stat
                  label="Per fill"
                  value={
                    <>
                      {med.qtyPerFill}
                      <span style={{ fontSize: 16, color: "var(--fg-3)", fontWeight: 500 }}>
                        {" "}
                        {med.form}s
                      </span>
                    </>
                  }
                  sub={<>{med.daysSupply}-day supply</>}
                />
                <Stat label="Your cost" value={`$${med.price.toFixed(2)}`} sub={<>After insurance</>} />
              </div>
            </div>
          </Card>

          <Card title="Prescription details">
            <div style={{ padding: 20 }}>
              <div className="kv">
                <span className="k">Drug name</span>
                <span className="v">
                  {med.name} {med.strength} {med.form}
                </span>
                <span className="k">Directions</span>
                <span className="v">{med.sig}</span>
                <span className="k">Quantity per fill</span>
                <span className="v">
                  {med.qtyPerFill} {med.form}s
                </span>
                <span className="k">Refills remaining</span>
                <span className="v">
                  {med.refillsRemaining} of {med.refillsTotal}
                </span>
                <span className="k">Rx number</span>
                <span className="v">{med.rxNumber}</span>
                <span className="k">Date written</span>
                <span className="v">January 14, 2026</span>
                <span className="k">Expires</span>
                <span className="v">January 14, 2027</span>
              </div>
            </div>
          </Card>

          <Card title="Prescriber">
            <div style={{ padding: 20 }}>
              <div className="row" style={{ gap: 14 }}>
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 9999,
                    background: "var(--brand-tint)",
                    color: "var(--brand-primary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    flex: "0 0 48px",
                  }}
                >
                  <Icon name="stethoscope" />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg-1)" }}>
                    {prescriber.name}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 2 }}>
                    {prescriber.specialty} · {prescriber.clinic}
                  </div>
                </div>
                <Button variant="secondary" size="sm" leadingIcon="phone">
                  {prescriber.phone}
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Recent fill history">
            <div className="lab-row" style={{ cursor: "default" }}>
              <div>
                <div className="lab-name">Filled at Maple St. Pharmacy</div>
                <div className="lab-meta">
                  {med.lastFilled} · 30-day supply · ${med.price.toFixed(2)}
                </div>
              </div>
              <div className="lab-right">
                <Pill tone="success">Delivered</Pill>
              </div>
            </div>
            <div className="lab-row" style={{ cursor: "default" }}>
              <div>
                <div className="lab-name">Filled at Maple St. Pharmacy</div>
                <div className="lab-meta">
                  Mar 9, 2026 · 30-day supply · ${med.price.toFixed(2)}
                </div>
              </div>
              <div className="lab-right">
                <Pill tone="success">Delivered</Pill>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-stack">
          <Card title="Refill & delivery">
            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <Pill tone={med.statusTone}>{med.status}</Pill>
              <p style={{ fontSize: 14, color: "var(--fg-2)", margin: 0 }}>
                You can refill on or after <b>{med.nextRefillDate}</b>. Choose pickup at
                Maple St. Pharmacy or schedule a home delivery.
              </p>
              <Button
                variant="primary"
                block
                leadingIcon="refresh-cw"
                onClick={() => setRefilling(true)}
              >
                Request refill
              </Button>
              <Button
                variant="secondary"
                block
                leadingIcon="truck"
                onClick={() => setScheduling(true)}
              >
                Schedule delivery
              </Button>
              <Button
                variant="ghost"
                block
                leadingIcon="message-square"
                onClick={() => nav("/messages")}
              >
                Message pharmacy
              </Button>
            </div>
          </Card>

          <Card title="Pharmacy">
            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-1)" }}>
                Maple St. Pharmacy
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-3)" }}>
                240 Maple St, San Francisco · Open until 9:00 PM
              </div>
              <Button
                variant="ghost"
                size="sm"
                leadingIcon="phone"
                style={{ alignSelf: "flex-start" }}
              >
                (415) 555-0240
              </Button>
            </div>
          </Card>

          <Card title="Insurance">
            <div style={{ padding: 20 }}>
              <div className="kv">
                <span className="k">Plan</span>
                <span className="v">{PATIENT.insurance.plan}</span>
                <span className="k">Member ID</span>
                <span className="v">{PATIENT.insurance.member}</span>
                <span className="k">Group</span>
                <span className="v">{PATIENT.insurance.group}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {refilling && (
        <Modal
          title="Request refill"
          onClose={() => setRefilling(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setRefilling(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setRefilling(false);
                  refillRx(med.id);
                }}
              >
                Confirm refill
              </Button>
            </>
          }
        >
          <div className="stack">
            <div style={{ fontSize: 15, color: "var(--fg-1)", lineHeight: 1.5 }}>
              You're about to refill{" "}
              <b>
                {med.name} {med.strength}
              </b>{" "}
              — {med.qtyPerFill} {med.form}s. {med.refillsRemaining} refills will remain
              after this.
            </div>
            <div
              className="summary-card"
              style={{ border: "1px solid var(--slate-200)" }}
            >
              <div className="summary-row">
                <span className="k">Medication</span>
                <span className="v">
                  {med.name} {med.strength}
                </span>
              </div>
              <div className="summary-row">
                <span className="k">Quantity</span>
                <span className="v">
                  {med.qtyPerFill} {med.form}s
                </span>
              </div>
              <div className="summary-row">
                <span className="k">Pharmacy</span>
                <span className="v">Maple St. Pharmacy</span>
              </div>
              <div className="summary-row total">
                <span className="k">Estimated cost</span>
                <span className="v">${med.price.toFixed(2)}</span>
              </div>
            </div>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              We'll text you when your refill is ready.
            </p>
          </div>
        </Modal>
      )}

      {scheduling && (
        <DeliverySchedulerModal
          med={med}
          onClose={() => setScheduling(false)}
          onConfirm={(date, win) => {
            setScheduling(false);
            onSchedule(date, win);
          }}
        />
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
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
        {label}
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
        {value}
      </div>
      {sub ? (
        <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 4 }}>{sub}</div>
      ) : null}
    </div>
  );
}

interface DeliverySchedulerModalProps {
  med: Prescription;
  onClose: () => void;
  onConfirm: (date: Date, win: string) => void;
}

function DeliverySchedulerModal({
  med,
  onClose,
  onConfirm,
}: DeliverySchedulerModalProps) {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Date | null>(null);
  const [windowChoice, setWindowChoice] = useState<string | null>(null);
  const [address, setAddress] = useState(PATIENT.address);

  const windows = [
    { id: "morning", label: "9:00 – 11:00 AM", note: "" },
    { id: "midday", label: "11:00 AM – 1:00 PM", note: "" },
    { id: "afternoon", label: "1:00 – 3:00 PM", note: "Most popular" },
    { id: "evening", label: "3:00 – 5:00 PM", note: "" },
    { id: "lateaft", label: "5:00 – 7:00 PM", note: "" },
    { id: "express", label: "Express, 2 hours", note: "+$5.00" },
  ];

  return (
    <Modal
      title="Schedule delivery"
      size="lg"
      onClose={onClose}
      footer={
        <>
          {step > 0 ? (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {step < 2 ? (
              <Button
                variant="primary"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 0 && !date) || (step === 1 && !windowChoice)
                }
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                leadingIcon="check"
                onClick={() => date && windowChoice && onConfirm(date, windowChoice)}
              >
                Confirm delivery
              </Button>
            )}
          </div>
        </>
      }
    >
      <div className="steps">
        <div className={`step ${step === 0 ? "active" : "done"}`}>
          <span className="step-num">{step > 0 ? <Icon name="check" /> : "1"}</span>{" "}
          Pick a date
        </div>
        <div className={`step ${step === 1 ? "active" : step > 1 ? "done" : ""}`}>
          <span className="step-num">{step > 1 ? <Icon name="check" /> : "2"}</span>{" "}
          Time window
        </div>
        <div className={`step ${step === 2 ? "active" : ""}`}>
          <span className="step-num">3</span> Confirm
        </div>
      </div>

      {step === 0 && (
        <div className="stack">
          <p style={{ fontSize: 14, color: "var(--fg-2)", margin: 0 }}>
            Delivering{" "}
            <b>
              {med.name} {med.strength}
            </b>{" "}
            to {PATIENT.address}.
          </p>
          <MiniCalendar value={date} onChange={setDate} todayDate={TODAY} />
          {date && (
            <div
              className="row"
              style={{
                gap: 8,
                padding: 12,
                background: "var(--brand-tint)",
                borderRadius: 8,
              }}
            >
              <Icon name="calendar" />
              <span style={{ fontSize: 14, color: "var(--brand-primary-hover)" }}>
                Selected:{" "}
                <b>
                  {date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </b>
              </span>
            </div>
          )}
        </div>
      )}

      {step === 1 && date && (
        <div className="stack">
          <p style={{ fontSize: 14, color: "var(--fg-2)", margin: 0 }}>
            Choose a 2-hour window for{" "}
            <b>
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </b>
            .
          </p>
          <div className="time-window-grid">
            {windows.map((w) => (
              <button
                key={w.id}
                type="button"
                className={`time-window ${windowChoice === w.id ? "selected" : ""}`}
                onClick={() => setWindowChoice(w.id)}
              >
                <span>{w.label}</span>
                {w.note ? (
                  <span className="muted" style={{ fontSize: 12, fontWeight: 500 }}>
                    {w.note}
                  </span>
                ) : (
                  <Icon name="chevron-right" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && date && windowChoice && (
        <div className="stack">
          <div
            className="summary-card"
            style={{ border: "1px solid var(--slate-200)" }}
          >
            <div className="summary-row">
              <span className="k">Medication</span>
              <span className="v">
                {med.name} {med.strength} · {med.qtyPerFill} {med.form}s
              </span>
            </div>
            <div className="summary-row">
              <span className="k">Delivery date</span>
              <span className="v">
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="summary-row">
              <span className="k">Time window</span>
              <span className="v">
                {windows.find((w) => w.id === windowChoice)?.label}
              </span>
            </div>
            <div className="summary-row">
              <span className="k">Delivery address</span>
              <span className="v" style={{ textAlign: "right", maxWidth: 280 }}>
                {address}
              </span>
            </div>
            <div className="summary-row total">
              <span className="k">Total</span>
              <span className="v">
                ${(med.price + (windowChoice === "express" ? 5 : 0)).toFixed(2)}
              </span>
            </div>
          </div>
          <Field label="Delivery address">
            <input
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Field>
          <Field label="Delivery instructions (optional)">
            <textarea
              className="textarea"
              placeholder="e.g. leave at door, call on arrival"
            />
          </Field>
        </div>
      )}
    </Modal>
  );
}
