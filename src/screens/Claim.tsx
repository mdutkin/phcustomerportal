// Identity verification — the gateway between "signed in" and "sees PHI".
//
// The security work happens server-side: the phone Firebase verified at sign-in
// must match the number the pharmacy has on file. That's the possession proof.
// Last name + DOB here only confirm WHICH person on that number this is, so
// this form is deliberately small — asking for more (SSN etc.) would add
// knowledge an attacker already has, not security.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/medico-logo.svg";
import { Button, Field } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useApp } from "@/context";
import { claimPatient } from "@/lib/api";
import { ApiError } from "@/lib/api";

import { PHARMACY, PHARMACY_TEL } from "@/lib/pharmacy";

const PHARMACY_PHONE = PHARMACY.phone;

export default function Claim() {
  const { refreshMe, signOut, firebaseUser } = useApp();
  const nav = useNavigate();

  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // When the pharmacy has to get involved, say so plainly instead of looping.
  const [needsHelp, setNeedsHelp] = useState(false);

  const canSubmit = lastName.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dob) && !busy;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await claimPatient(lastName.trim(), dob);
      await refreshMe();
      nav("/");
    } catch (e) {
      const err = e as ApiError;
      // These all mean "a human needs to sort this out" — don't make them retry.
      if (
        err.code === "ambiguous_match" ||
        err.code === "patient_already_claimed" ||
        err.code === "phone_verification_required"
      ) {
        setNeedsHelp(true);
        setError(err.message);
      } else if (err.code === "already_linked") {
        await refreshMe();
        nav("/");
      } else {
        setError(err.message || "We couldn't verify those details. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-shell" data-screen-label="Verify identity">
      <aside className="login-aside">
        <div>
          <img src={logo} alt="Medico Pharmacy" className="brand-logo" />
        </div>
        <div className="stack-lg">
          <h2 className="login-quote">
            One quick check, and your prescriptions are <em>right here</em>.
          </h2>
          <p className="login-attrib">
            We match you to your pharmacy record using the mobile number you just verified.
          </p>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-card">
          <h1 className="login-title">Verify it's you</h1>
          <p className="login-sub">
            Your number{" "}
            {firebaseUser?.phoneNumber ? (
              <b>ending {firebaseUser.phoneNumber.slice(-4)}</b>
            ) : (
              "is verified"
            )}
            . Confirm your name and date of birth to see your prescriptions.
          </p>

          {needsHelp ? (
            <div className="login-form">
              <div className="stack-lg">
                <p style={{ margin: 0 }}>{error}</p>
                <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                  Give us a call and we'll get you set up in a minute.
                </p>
                <a className="link" href={`tel:${PHARMACY_TEL}`}>
                  <Icon name="smartphone" /> {PHARMACY_PHONE}
                </a>
              </div>
              <Button variant="secondary" block onClick={() => setNeedsHelp(false)}>
                Try again
              </Button>
            </div>
          ) : (
            <div className="login-form">
              <Field label="Last name" hint="As it appears on your prescription label.">
                <input
                  className="input"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Chen"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Field>
              <Field label="Date of birth">
                <input
                  className="input"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </Field>

              {error && (
                <p style={{ color: "var(--danger, #c0392b)", fontSize: 14, margin: 0 }}>{error}</p>
              )}

              <Button variant="primary" size="lg" block onClick={onSubmit} disabled={!canSubmit}>
                {busy ? "Checking…" : "Continue"}
              </Button>

              <p className="muted" style={{ fontSize: 13, textAlign: "center", margin: 0 }}>
                Not finding you? Call us at{" "}
                <a className="link" style={{ display: "inline" }} href={`tel:${PHARMACY_TEL}`}>
                  {PHARMACY_PHONE}
                </a>
              </p>
            </div>
          )}

          <div className="login-trust">
            <span>
              <Icon name="shield-check" /> HIPAA-secured
            </span>
            <span>
              <Icon name="lock" /> Encrypted at rest
            </span>
          </div>

          <div className="login-foot">
            <p style={{ margin: 0, fontSize: 12 }}>
              Wrong account?{" "}
              <a
                className="link"
                style={{ display: "inline", cursor: "pointer" }}
                onClick={async () => {
                  await signOut();
                  nav("/login");
                }}
              >
                Sign out
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
