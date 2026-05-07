// Billing — outstanding balance + recent charges + pay confirmation modal.

import { useState } from "react";
import { Button, Card, Modal, Pill } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/Layout";
import { BILLING, PATIENT } from "@/data";
import { useApp } from "@/context";

export default function Billing() {
  const { balance, payBalance } = useApp();
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const onPay = () => {
    setPaid(true);
    setTimeout(() => {
      setPaying(false);
      setPaid(false);
      payBalance();
    }, 1400);
  };

  return (
    <main className="page" data-screen-label="Billing">
      <PageHeader
        title="Billing"
        sub="Pay your outstanding balance and review recent charges."
      />

      <div className="cols-1-2">
        <div className="col-stack">
          <Card>
            <div
              style={{
                padding: 28,
                background:
                  "linear-gradient(135deg, #F8FAFC 0%, #E5EBF7 100%)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--fg-3)",
                }}
              >
                Outstanding balance
              </div>
              <div
                className="tabular"
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "var(--fg-1)",
                  marginTop: 8,
                  lineHeight: 1,
                }}
              >
                ${balance.toFixed(2)}
              </div>
              <div style={{ fontSize: 14, color: "var(--fg-3)", marginTop: 8 }}>
                Due by{" "}
                <b style={{ color: "var(--fg-1)" }}>{BILLING.dueDate}</b>
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <Button
                  variant="primary"
                  leadingIcon="credit-card"
                  onClick={() => setPaying(true)}
                  disabled={balance <= 0}
                >
                  Pay now
                </Button>
                <Button variant="secondary">Set up payment plan</Button>
              </div>
            </div>
          </Card>
          <Card title="Saved payment method">
            <div style={{ padding: 20 }}>
              <div className="row-spread">
                <div className="row" style={{ gap: 12 }}>
                  <span
                    style={{
                      width: 44,
                      height: 32,
                      borderRadius: 6,
                      background:
                        "linear-gradient(135deg, #1A1F71 0%, #1A1F71 60%, #F7B600 60%)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                    }}
                  >
                    VISA
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--fg-1)",
                      }}
                    >
                      Visa ending in {BILLING.card.last4}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--fg-3)" }}>
                      Exp {BILLING.card.exp}
                    </div>
                  </div>
                </div>
                <button type="button" className="link">
                  Manage
                </button>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Recent charges">
          {BILLING.recent.map((r) => (
            <div key={r.id} className="lab-row" style={{ cursor: "default" }}>
              <div>
                <div className="lab-name">{r.desc}</div>
                <div className="lab-meta">{r.date}</div>
              </div>
              <div className="lab-right">
                <span
                  className="tabular"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--fg-1)",
                  }}
                >
                  ${r.amount.toFixed(2)}
                </span>
                <Pill tone={r.status === "Paid" ? "success" : "warning"}>
                  {r.status}
                </Pill>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {paying && !paid && (
        <Modal
          title="Confirm payment"
          onClose={() => setPaying(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setPaying(false)}>
                Cancel
              </Button>
              <Button variant="primary" leadingIcon="lock" onClick={onPay}>
                Pay ${balance.toFixed(2)}
              </Button>
            </>
          }
        >
          <div className="stack">
            <div
              className="summary-card"
              style={{ border: "1px solid var(--slate-200)" }}
            >
              <div className="summary-row">
                <span className="k">Charges</span>
                <span className="v">2 outstanding items</span>
              </div>
              <div className="summary-row">
                <span className="k">Payment method</span>
                <span className="v">Visa · {BILLING.card.last4}</span>
              </div>
              <div className="summary-row total">
                <span className="k">Total</span>
                <span className="v">${balance.toFixed(2)}</span>
              </div>
            </div>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              You'll get an email receipt at {PATIENT.email}.
            </p>
          </div>
        </Modal>
      )}

      {paid && (
        <Modal
          title="Payment received"
          onClose={() => {
            setPaying(false);
            setPaid(false);
            payBalance();
          }}
        >
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                background: "var(--success-bg)",
                color: "var(--success-700)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Icon name="check" style={{ width: 28, height: 28 }} />
            </span>
            <p
              style={{
                fontSize: 16,
                color: "var(--fg-1)",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Thank you — ${balance.toFixed(2)} paid.
            </p>
            <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
              A receipt has been emailed to you.
            </p>
          </div>
        </Modal>
      )}
    </main>
  );
}
