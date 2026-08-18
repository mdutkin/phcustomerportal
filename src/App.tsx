// Top-level layout: TopNav + routed page + ToastStack.

import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { TopNav, type RouteKey } from "@/components/Layout";
import { MobileTabBar } from "@/components/MobileTabBar";
import { ToastStack } from "@/components/ui";
import { useApp } from "@/context";
import DashboardA from "@/screens/DashboardA";
import Login from "@/screens/Login";
import Claim from "@/screens/Claim";
import Prescriptions from "@/screens/Prescriptions";
import PrescriptionDetail from "@/screens/PrescriptionDetail";
import DrugInfo from "@/screens/DrugInfo";
import Messages from "@/screens/Messages";
import Profile from "@/screens/Profile";

function activeFromPath(path: string): RouteKey {
  if (path === "/" || path.startsWith("/dashboard")) return "Dashboard";
  if (path.startsWith("/prescriptions")) return "prescriptions";
  if (path.startsWith("/rx")) return "prescriptions";
  if (path.startsWith("/drug")) return "prescriptions";
  if (path.startsWith("/messages")) return "messages";
  if (path.startsWith("/profile")) return "profile";
  return "Dashboard";
}

// Guards the claim screen itself: you must be signed in to claim, and if you're
// already linked there's nothing to do here.
function ClaimGate() {
  const { authed, authLoading, me, meLoading } = useApp();
  if (authLoading || (authed && meLoading && !me)) {
    return <div className="auth-loading">Loading…</div>;
  }
  if (!authed) return <Navigate to="/login" replace />;
  if (me?.link) return <Navigate to="/" replace />;
  return <Claim />;
}

function ProtectedShell() {
  const { authed, authLoading, me, meLoading, patient, unreadMsg, toasts } = useApp();
  const loc = useLocation();

  // Wait for Firebase to restore the session before deciding to redirect.
  if (authLoading) {
    return <div className="auth-loading">Loading…</div>;
  }
  if (!authed) {
    return <Navigate to="/login" replace />;
  }
  // Signed in, but we don't know their PrimeRX link yet.
  if (meLoading && !me) {
    return <div className="auth-loading">Loading…</div>;
  }
  // Signed in but not linked to a patient record → must verify identity first.
  // Everything behind this shell is PHI, so this gate is not optional.
  if (me && !me.link) {
    return <Navigate to="/claim" replace />;
  }

  const active = activeFromPath(loc.pathname);
  return (
    <>
      <TopNav active={active} patient={patient} msgCount={unreadMsg} />
      <Outlet />
      <ToastStack toasts={toasts} />
      <MobileTabBar active={active} />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Signed in but not yet linked to a patient record. Outside
          ProtectedShell — that shell requires a link. */}
      <Route path="/claim" element={<ClaimGate />} />

      <Route element={<ProtectedShell />}>
        <Route path="/" element={<DashboardA />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/rx/:id" element={<PrescriptionDetail />} />
        <Route path="/drug/:id" element={<DrugInfo />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
