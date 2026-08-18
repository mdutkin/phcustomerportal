// Profile — account sections backed by real /me data (PrimeRX + our user row).
// Only sections we actually have data for: personal info, allergies, insurance,
// addresses. Payment / Security / Notifications were dropped — no data source
// (payments), N/A for phone-only auth (security), or no prefs backend (notifs).
// Read-only for now; Edit will later route through the pharmacist request queue.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Pill } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { PageHeader } from "@/components/Layout";
import { useApp } from "@/context";

type SectionId = "personal" | "allergies" | "insurance" | "addresses";

interface Section {
  id: SectionId;
  label: string;
  icon: IconName;
}

export default function Profile() {
  const nav = useNavigate();
  const { patient, signOut } = useApp();
  const [section, setSection] = useState<SectionId>("personal");

  const sections: Section[] = [
    { id: "personal", label: "Personal info", icon: "user" },
    { id: "allergies", label: "Allergies", icon: "heart-pulse" },
    { id: "insurance", label: "Insurance", icon: "shield" },
    { id: "addresses", label: "Addresses", icon: "map-pin" },
  ];

  const onLogout = async () => {
    await signOut();
    nav("/login");
  };

  return (
    <main className="page" data-screen-label="Profile">
      <PageHeader title="Account" sub="Personal info, insurance, and allergies." />

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
            <Card title="Personal information">
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

          {section === "allergies" && (
            <Card title="Allergies">
              <div style={{ padding: 20 }}>
                {patient.allergies.length > 0 ? (
                  <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                    {patient.allergies.map((a) => (
                      <Pill key={a} tone="danger" icon="alert-triangle">
                        {a}
                      </Pill>
                    ))}
                  </div>
                ) : (
                  <div className="muted" style={{ fontSize: 14 }}>
                    No allergies on file. If that's not right, call the pharmacy to update it.
                  </div>
                )}
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
        </div>
      </div>
    </main>
  );
}
