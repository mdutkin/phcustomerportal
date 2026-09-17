// Admin → Team: who has staff access, and granting/revoking it.
// The ONLY UI path to a role. Creating an account returns a temporary
// password once; the admin hands it over out of band.

import { useCallback, useEffect, useState } from "react";
import { Button, Field } from "@/components/ui";
import { useApp } from "@/context";
import { ApiError, createStaffUser, listUsers, setUserRole } from "@/lib/api";
import type { AdminUser, UserRole } from "@/lib/types";
import { fmtDate } from "@/lib/dates";

export default function Team() {
  const { firebaseUser, pushToast } = useApp();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"pharmacist" | "admin">("pharmacist");
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<{ email: string; password: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await listUsers();
      // Staff first; patients are listed only so an admin can revoke a
      // mistaken grant, and they're the long tail.
      setUsers(all.filter((u) => u.role !== "patient"));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const r = await createStaffUser({ email, role });
      setIssued(r.temporaryPassword ? { email: r.email, password: r.temporaryPassword } : null);
      setEmail("");
      pushToast(`${r.email} added as ${r.role}.`);
      await load();
    } catch (err) {
      const a = err as ApiError;
      pushToast(a.code === "email_already_exists" ? "That email already has an account." : a.message || "Couldn't create the account.");
    } finally {
      setBusy(false);
    }
  };

  const change = async (u: AdminUser, next: UserRole) => {
    try {
      await setUserRole(u.firebaseUid, next);
      pushToast(`${u.email ?? u.firebaseUid} → ${next}`);
      await load();
    } catch (err) {
      const a = err as ApiError;
      pushToast(a.code === "cannot_demote_self" ? "You can't remove your own admin role." : a.message || "Couldn't change the role.");
    }
  };

  return (
    <div className="staff-page">
      <h1 className="staff-h1">Team</h1>
      <p className="muted">Staff accounts sign in at <code>/staff/login</code> with email and password. Patients never appear here.</p>

      <form className="staff-inline-form" onSubmit={(e) => void create(e)}>
        <Field label="Work email">
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@medicopharmacy.com" />
        </Field>
        <Field label="Role">
          <select className="input" value={role} onChange={(e) => setRole(e.target.value as "pharmacist" | "admin")}>
            <option value="pharmacist">Pharmacist</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <Button type="submit" variant="primary" disabled={busy || !email}>{busy ? "Adding…" : "Add staff account"}</Button>
      </form>

      {issued ? (
        <div className="staff-callout">
          <strong>Temporary password for {issued.email}</strong> — shown once, hand it over in person:
          <code className="staff-secret">{issued.password}</code>
          <Button variant="secondary" size="sm" onClick={() => setIssued(null)}>Done</Button>
        </div>
      ) : null}

      <table className="staff-table">
        <thead>
          <tr><th>Email</th><th>Role</th><th>Last sign-in</th><th>Created</th><th /></tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="muted">Loading…</td></tr>
          ) : users.map((u) => {
            const self = u.firebaseUid === firebaseUser?.uid;
            return (
              <tr key={u.id}>
                <td>{u.email ?? <span className="muted">{u.phoneE164}</span>}{self ? <span className="staff-badge">you</span> : null}</td>
                <td><span className="staff-badge">{u.role}</span></td>
                <td>{fmtDate(u.lastLoginAt, { month: "short", day: "numeric", year: "numeric" }, "never")}</td>
                <td>{fmtDate(u.createdAt)}</td>
                <td className="staff-actions">
                  {u.role !== "admin" ? <Button size="sm" variant="secondary" onClick={() => void change(u, "admin")}>Make admin</Button> : null}
                  {u.role !== "pharmacist" && !self ? <Button size="sm" variant="secondary" onClick={() => void change(u, "pharmacist")}>Make pharmacist</Button> : null}
                  {!self ? <Button size="sm" variant="ghost" onClick={() => void change(u, "patient")}>Revoke access</Button> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
