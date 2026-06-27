// Login screen. v1 = real Firebase phone sign-in (sign-up and sign-in are the
// same flow). Email/Google tabs are placeholders until later phases.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ConfirmationResult } from "firebase/auth";
import logo from "@/assets/medico-logo.svg";
import { Button, Field } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useApp } from "@/context";
import { sendSmsCode, confirmSmsCode } from "@/lib/auth";
import { syncMe } from "@/lib/api";

type Method = "phone" | "email" | "google";

export default function Login() {
  const { pushToast } = useApp();
  const nav = useNavigate();

  const [method, setMethod] = useState<Method>("phone");
  const [phone, setPhone] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSendCode = async () => {
    if (phone.replace(/\D/g, "").length < 10 || busy) return;
    setBusy(true);
    try {
      const conf = await sendSmsCode(phone, "recaptcha-container");
      setConfirmation(conf);
      setOtpStep(true);
    } catch {
      pushToast("Couldn't send a code to that number. Check it and try again.");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (code: string) => {
    if (!confirmation || code.length !== 6 || busy) return;
    setBusy(true);
    try {
      await confirmSmsCode(confirmation, code);
      await syncMe(); // best-effort: provision backend user row
      nav("/"); // onAuthStateChanged flips `authed`; ProtectedShell renders
    } catch {
      pushToast("That code didn't match. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setBusy(false);
    }
  };

  const comingSoon = () => pushToast("Phone sign-in is the only method right now.");

  const handleOtpChange = (i: number, v: string) => {
    const next = [...otp];
    next[i] = v.replace(/\D/g, "").slice(0, 1);
    setOtp(next);
    if (v && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null;
      el?.focus();
    }
    if (next.every((x) => x.length === 1)) void verifyCode(next.join(""));
  };

  return (
    <div className="login-shell" data-screen-label="Login">
      <aside className="login-aside">
        <div>
          <img src={logo} alt="Medico Pharmacy" className="brand-logo" />
        </div>
        <div className="stack-lg">
          <h2 className="login-quote">
            Your prescriptions, lab results, and pharmacy <em>in one calm place</em>.
          </h2>
          <p className="login-attrib">
            Used by 2.4 million patients across 1,200 pharmacies in the U.S.
          </p>
        </div>
        <div className="login-stats">
          <div>
            <div className="login-stat-num tabular">2.4M</div>
            <div className="login-stat-lbl">Active patients</div>
          </div>
          <div>
            <div className="login-stat-num tabular">1,200+</div>
            <div className="login-stat-lbl">Partner pharmacies</div>
          </div>
          <div>
            <div className="login-stat-num tabular">98.4%</div>
            <div className="login-stat-lbl">Refills on time</div>
          </div>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-card">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">
            Sign in to refill prescriptions, view lab results, and manage deliveries.
          </p>

          <div className="login-method-tabs">
            <button
              type="button"
              className={`seg-opt ${method === "phone" ? "active" : ""}`}
              onClick={() => {
                setMethod("phone");
                setOtpStep(false);
              }}
            >
              <Icon name="smartphone" /> Phone
            </button>
            <button
              type="button"
              className={`seg-opt ${method === "email" ? "active" : ""}`}
              onClick={() => setMethod("email")}
            >
              <Icon name="mail" /> Email
            </button>
            <button
              type="button"
              className={`seg-opt ${method === "google" ? "active" : ""}`}
              onClick={() => setMethod("google")}
            >
              <Icon name="globe" /> Google
            </button>
          </div>

          {method === "phone" && !otpStep && (
            <div className="login-form">
              <Field
                label="Mobile phone number"
                hint="We'll send a 6-digit code by text. Standard rates apply."
              >
                <div className="input-group">
                  <span className="input-prefix">
                    <Icon name="flag" /> +1
                  </span>
                  <input
                    className="input"
                    type="tel"
                    inputMode="tel"
                    placeholder="(555) 555-0100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </Field>
              <Button
                variant="primary"
                size="lg"
                block
                onClick={handleSendCode}
                disabled={phone.replace(/\D/g, "").length < 10 || busy}
              >
                {busy ? "Sending…" : "Send code"}
              </Button>
            </div>
          )}

          {method === "phone" && otpStep && (
            <div className="login-form">
              <Field label="Enter the 6-digit code">
                <div className="otp-row">
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      className="otp-input"
                      inputMode="numeric"
                      maxLength={1}
                      value={v}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                    />
                  ))}
                </div>
                <p className="otp-help">
                  Sent to <b>{phone}</b>.{" "}
                  <a
                    className="link"
                    onClick={() => setOtpStep(false)}
                    style={{ display: "inline" }}
                  >
                    Change number
                  </a>{" "}
                  · <a className="link" style={{ display: "inline" }}>Resend code</a>
                </p>
              </Field>
              <Button
                variant="secondary"
                block
                disabled={busy}
                onClick={() => void verifyCode(otp.join(""))}
              >
                {busy ? "Verifying…" : "Verify and continue"}
              </Button>
            </div>
          )}

          {method === "email" && (
            <div className="login-form">
              <Field label="Email address">
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Password">
                <div className="input-group">
                  <input
                    className="input"
                    type={showPw ? "text" : "password"}
                    placeholder="Your password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                  />
                  <button
                    className="icon-btn"
                    style={{ marginRight: 4 }}
                    onClick={() => setShowPw((s) => !s)}
                    type="button"
                    aria-label="Show password"
                  >
                    <Icon name={showPw ? "eye-off" : "eye"} />
                  </button>
                </div>
              </Field>
              <div className="row-spread">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "var(--fg-2)",
                  }}
                >
                  <input type="checkbox" /> Keep me signed in
                </label>
                <a className="link">Forgot password?</a>
              </div>
              <Button variant="primary" size="lg" block onClick={comingSoon}>
                Sign in
              </Button>
            </div>
          )}

          {method === "google" && (
            <div className="login-form">
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                Continue with the Google account associated with your Medico Pharmacy
                profile. We never share your medical data with Google.
              </p>
              <button className="login-google-btn" onClick={comingSoon} type="button">
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 7.1 29.5 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4c-2 1.4-4.6 2.3-7.5 2.3-5.3 0-9.7-3.4-11.3-8L6 32.6C9.4 39.3 16.1 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.6l6.5 5.4c-.4.4 7.3-5.3 7.3-15-.1-1.4-.2-2.4-.4-3.5z"
                  />
                </svg>
                Continue with Google
              </button>
              <p
                className="muted"
                style={{ fontSize: 12, textAlign: "center", margin: 0 }}
              >
                You'll be taken to Google to confirm, then returned here.
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
            <span>
              <Icon name="user-check" /> SOC 2 Type II
            </span>
          </div>

          {/* Invisible reCAPTCHA mount for Firebase phone auth. */}
          <div id="recaptcha-container" />

          <div className="login-foot">
            <p style={{ margin: 0 }}>
              New to Medico? <a>Create an account</a>
            </p>
            <p style={{ margin: 0, fontSize: 12 }}>
              By continuing you agree to the <a>Terms</a> and <a>Privacy Notice</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
