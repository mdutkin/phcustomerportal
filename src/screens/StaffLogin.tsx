// Staff sign-in — pharmacists and admins. Email + password, accounts created
// by an admin only. Deliberately a separate page from the patient login:
// email carries no verified phone, so it must never reach the claim flow, and
// patients must never be offered it.

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button, Field } from "@/components/ui";
import { useApp } from "@/context";
import { signInStaff } from "@/lib/auth";
import { PHARMACY } from "@/lib/pharmacy";
import logo from "@/assets/medico-logo.svg";

export default function StaffLogin() {
  const nav = useNavigate();
  const { authed, authLoading, isStaff } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && authed && isStaff) return <Navigate to="/staff" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signInStaff(email, password);
      nav("/staff", { replace: true });
    } catch {
      // Same message for wrong email, wrong password and unknown account —
      // don't confirm which staff addresses exist.
      setError("Email or password is incorrect.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-shell" data-screen-label="Staff sign in">
      <aside className="login-aside">
        <div>
          <img src={logo} alt={PHARMACY.name} className="brand-logo" />
        </div>
        <div className="stack-lg">
          <h2 className="login-quote">
            Staff console for <em>{PHARMACY.name}</em>.
          </h2>
          <p className="login-attrib">
            Refill work lists, patient requests and outreach. Accounts are created by an
            administrator — there is no sign-up.
          </p>
        </div>
      </aside>
      <main className="login-main">
        <div className="login-card">
          <h1 className="login-title">Staff sign in</h1>
          <p className="login-sub">Use the email and password you were given.</p>
          <form className="login-form" onSubmit={(e) => void submit(e)}>
            <Field label="Work email">
              <input
                className="input"
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Password">
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {error ? (
              <div className="muted" style={{ color: "var(--danger-600, #b42318)", fontSize: 14 }}>
                {error}
              </div>
            ) : null}
            <Button type="submit" variant="primary" size="lg" block disabled={busy || !email || !password}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>
            Patient? <a href="/login">Sign in with your mobile number instead.</a>
          </p>
        </div>
      </main>
    </div>
  );
}
