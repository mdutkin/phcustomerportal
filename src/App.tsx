// Top-level layout: TopNav + routed page + ToastStack.

import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { TopNav, type RouteKey } from "@/components/Layout";
import { ToastStack } from "@/components/ui";
import { useApp } from "@/context";
import DashboardA from "@/screens/DashboardA";
import Login from "@/screens/Login";
import Prescriptions from "@/screens/Prescriptions";
import PrescriptionDetail from "@/screens/PrescriptionDetail";
import DrugInfo from "@/screens/DrugInfo";
import Labs from "@/screens/Labs";
import LabDetail from "@/screens/LabDetail";
import Shop from "@/screens/Shop";
import Cart from "@/screens/Cart";
import Billing from "@/screens/Billing";
import Messages from "@/screens/Messages";
import Profile from "@/screens/Profile";

function activeFromPath(path: string): RouteKey {
  if (path === "/" || path.startsWith("/dashboard")) return "Dashboard";
  if (path.startsWith("/prescriptions")) return "prescriptions";
  if (path.startsWith("/rx")) return "prescriptions";
  if (path.startsWith("/drug")) return "prescriptions";
  if (path.startsWith("/labs") || path.startsWith("/lab")) return "labs";
  if (path.startsWith("/shop")) return "shop";
  if (path.startsWith("/cart")) return "shop";
  if (path.startsWith("/billing")) return "billing";
  if (path.startsWith("/messages")) return "messages";
  if (path.startsWith("/profile")) return "profile";
  return "Dashboard";
}

function ProtectedShell() {
  const { authed, patient, cart, unreadMsg, toasts } = useApp();
  const loc = useLocation();
  const nav = useNavigate();

  if (!authed) {
    nav("/login", { replace: true });
    return null;
  }

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  return (
    <>
      <TopNav
        active={activeFromPath(loc.pathname)}
        patient={patient}
        cartCount={cartCount}
        msgCount={unreadMsg}
      />
      <Outlet />
      <ToastStack toasts={toasts} />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedShell />}>
        <Route path="/" element={<DashboardA />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/rx/:id" element={<PrescriptionDetail />} />
        <Route path="/drug/:id" element={<DrugInfo />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/lab/:id" element={<LabDetail />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
