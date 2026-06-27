// Profile — account sections (personal, health, insurance, addresses, payment, security, notif).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Pill } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { PageHeader } from "@/components/Layout";
import { BILLING } from "@/data";
import { useApp } from "@/context";

interface Section {
  id: SectionId;
  label: string;
  icon: IconName;
}
type SectionId =
  | "personal"
  | "health"
  | "insurance"
  | "addresses"
  | "payment"
  | "security"
  | "notif";

export default function Profile() {
  const nav = useNavigate();
  const { patient, signOut } = useApp();
  const [section, setSection] = useState<SectionId>("personal");

  const sections: Section[] = [
    { id: "personal", label: "Personal info", icon: "user" },
    { id: "health", label: "Health profile", icon: "heart-pulse" },
    { id: "insurance", label: "Insurance", icon: "shield" },
    { id: "addresses", label: "Addresses", icon: "map-pin" },
    { id: "payment", label: "Payment methods", icon: "credit-card" },
    { id: "security", label: "Security", icon: "lock" },
    { id: "notif", label: "Notifications", icon: "bell" },
  ];

  const onLogout = async () => {
    await signOut();
    nav("/login");
  };

  return (
    <main className="page" data-screen-label="Profile">
      <PageHeader title="Account" sub="Personal info, insurance, and security." />

      <div className="cols-1-2">
        <Card>
          <div className="profile-header">
            <span className="profile-avatar-lg">{patient.initials}</span>
            <div>
              <div className="profile-name">{patient.name}</div>
              <div className="profile-meta">
                DOB {patient.dob} · Age {patient.age}
              </div>
              <div className="profile-meta">{patient.email}</div>
            </div>
          </div>
          <div
            className="side-nav"
            style={{ padding: 12, borderTop: "1px solid var(--slate-100)" }}
          >
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`side-link ${section === s.id ? "active" : ""}`}
                onClick={() => setSection(s.id)}
              >
                <Icon name={s.icon} /> {s.label}
              </button>
            ))}
            <button
              type="button"
              className="side-link"
              style={{ color: "var(--danger-700)", marginTop: 8 }}
              onClick={onLogout}
            >
              <Icon name="log-out" /> Sign out
            </button>
          </div>
        </Card>

        <div className="col-stack">
          {section === "personal" && (
            <Card
              title="Personal information"
              action={
                <Button variant="ghost" size="sm" leadingIcon="edit-2">
                  Edit
                </Button>
              }
            >
              <div style={{ padding: 20 }}>
                <div className="kv">
                  <span className="k">Full name</span>
                  <span className="v">{patient.name}</span>
                  <span className="k">Date of birth</span>
                  <span className="v">{patient.dob}</span>
                  <span className="k">Mobile phone</span>
                  <span className="v">{patient.phone}</span>
                  <span className="k">Email</span>
                  <span className="v">{patient.email}</span>
                  <span className="k">Preferred pharmacy</span>
                  <span className="v">{patient.pharmacy}</span>
                </div>
              </div>
            </Card>
          )}
          {section === "health" && (
            <Card title="Health profile">
              <div style={{ padding: 20 }}>
                <div className="kv">
                  <span className="k">Allergies</span>
                  <span className="v">
                    {patient.allergies.map((a) => (
                      <Pill key={a} tone="danger" icon="alert-triangle">
                        {a}
                      </Pill>
                    ))}
                  </span>
                  <span className="k">Conditions</span>
                  <span className="v">
                    High cholesterol · Hypertension · Type 2 diabetes
                  </span>
                  <span className="k">Primary care</span>
                  <span className="v">
                    Dr. Rohan Patel — Bay Family Health
                  </span>
                  <span className="k">Pharmacist</span>
                  <span className="v">
                    Maria Torres, RPh — Maple St. Pharmacy
                  </span>
                </div>
              </div>
            </Card>
          )}
          {section === "insurance" && (
            <Card title="Insurance">
              <div style={{ padding: 20 }}>
                <div className="kv">
                  <span className="k">Plan</span>
                  <span className="v">{patient.insurance.plan}</span>
                  <span className="k">Member ID</span>
                  <span className="v">{patient.insurance.member}</span>
                  <span className="k">Group</span>
                  <span className="v">{patient.insurance.group}</span>
                  <span className="k">Effective</span>
                  <span className="v">Jan 1, 2026 – Dec 31, 2026</span>
                </div>
              </div>
            </Card>
          )}
          {section === "addresses" && (
            <Card title="Addresses">
              <div style={{ padding: 20 }}>
                <div className="kv">
                  <span className="k">Home</span>
                  <span className="v">{patient.address}</span>
                </div>
              </div>
            </Card>
          )}
          {section === "payment" && (
            <Card title="Payment methods">
              <div style={{ padding: 20 }}>
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
                      Visa · {BILLING.card.last4}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--fg-3)" }}>
                      Exp {BILLING.card.exp} · Default
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
          {section === "security" && (
            <Card title="Security">
              <div
                style={{
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div className="row-spread">
                  <span>
                    <b>Two-factor authentication</b>
                    <div className="muted" style={{ fontSize: 13 }}>
                      Text message to {patient.phone}
                    </div>
                  </span>
                  <Pill tone="success" icon="check">
                    On
                  </Pill>
                </div>
                <div className="row-spread">
                  <span>
                    <b>Password</b>
                    <div className="muted" style={{ fontSize: 13 }}>
                      Last changed Feb 12, 2026
                    </div>
                  </span>
                  <Button variant="ghost" size="sm">
                    Change
                  </Button>
                </div>
                <div className="row-spread">
                  <span>
                    <b>Connected accounts</b>
                    <div className="muted" style={{ fontSize: 13 }}>
                      Google · margaret.chen@gmail.com
                    </div>
                  </span>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </Card>
          )}
          {section === "notif" && (
            <Card title="Notifications">
              <div style={{ padding: 20 }}>
                <div className="muted" style={{ fontSize: 14 }}>
                  Choose how Medico contacts you about refills, deliveries, and lab
                  results.
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
