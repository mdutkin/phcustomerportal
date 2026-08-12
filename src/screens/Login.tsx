// Login screen. v1 = real Firebase phone sign-in (sign-up and sign-in are the
// same flow). Phone is the only method: it's our proof-of-possession factor,
// the number Firebase verifies is what we match against the patient's on-file
// number at claim time. Email/Google are intentionally omitted until we add a
// phone-link step (they carry no verified phone, so they can't gate claim).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ConfirmationResult } from "firebase/auth";
import logo from "@/assets/medico-logo.svg";
import { Button, Field } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useApp } from "@/context";
import { sendSmsCode, confirmSmsCode } from "@/lib/auth";
import { syncMe } from "@/lib/api";

export default function Login() {
  const { pushToast } = useApp();
  const nav = useNavigate();

  const [phone, setPhone] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
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

          {!otpStep && (
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

          {otpStep && (
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
