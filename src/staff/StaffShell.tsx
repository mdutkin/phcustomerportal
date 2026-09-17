// Staff console shell. Dense, utilitarian — not the calm patient layout.
// Everything under here is PHI for every patient, so the gate is: signed in
// AND a staff role on the token. Patients (no role) never see this tree.

import { NavLink, Navigate, Outlet } from "react-router-dom";
import { ToastStack } from "@/components/ui";
import { useApp } from "@/context";
import { PHARMACY } from "@/lib/pharmacy";

export default function StaffShell() {
  const { authed, authLoading, isStaff, role, firebaseUser, signOut, toasts } = useApp();
  if (authLoading) return <div className="auth-loading">Loading…</div>;
  if (!authed || !isStaff) return <Navigate to="/staff/login" replace />;

  const link = ({ isActive }: { isActive: boolean }) => `staff-nav-link${isActive ? " is-active" : ""}`;
  return (
    <div className="staff-shell">
      <header className="staff-top">
        <div className="staff-brand">
          {PHARMACY.name} <span className="staff-badge">staff</span>
        </div>
        <nav className="staff-nav">
          <NavLink to="/staff" end className={link}>Work list</NavLink>
          <NavLink to="/staff/requests" className={link}>Requests</NavLink>
          {role === "admin" ? <NavLink to="/staff/team" className={link}>Team</NavLink> : null}
        </nav>
        <div className="staff-user">
          <span className="muted">{firebaseUser?.email}</span>
          <span className="staff-badge">{role}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => void signOut()}>Sign out</button>
        </div>
      </header>
      <main className="staff-main">
        <Outlet />
      </main>
      <ToastStack toasts={toasts} />
    </div>
  );
}
