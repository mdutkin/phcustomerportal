// MobileTabBar — fixed bottom tab navigation for mobile breakpoints (≤640px).
// Hidden via CSS at desktop widths; complements TopNav whose tab strip is hidden on mobile.

import { Link } from "react-router-dom";
import { Icon, type IconName } from "./Icon";
import type { RouteKey } from "./Layout";

interface MobileTab {
  id: RouteKey;
  label: string;
  icon: IconName;
  to: string;
}

const tabs: MobileTab[] = [
  { id: "Dashboard",     label: "Home",     icon: "home",          to: "/" },
  { id: "prescriptions", label: "Rx",       icon: "pill",          to: "/prescriptions" },
  { id: "messages",      label: "Messages", icon: "message-square", to: "/messages" },
  { id: "profile",       label: "Account",  icon: "user",          to: "/profile" },
];

interface MobileTabBarProps {
  active: RouteKey;
}

export function MobileTabBar({ active }: MobileTabBarProps) {
  return (
    <nav className="mobile-tabbar" aria-label="Primary mobile">
      {tabs.map((t) => (
        <Link
          key={t.id}
          to={t.to}
          className={`mobile-tab ${active === t.id ? "active" : ""}`}
          aria-current={active === t.id ? "page" : undefined}
        >
          <Icon name={t.icon} />
          <span>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}
