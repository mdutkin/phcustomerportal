// TopNav (primary navigation) + PageHeader (in-page header with crumbs).

import { Fragment, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/medico-logo.svg";
import type { Patient } from "@/data";
import { Icon, type IconName } from "./Icon";

export type RouteKey =
  | "Dashboard"
  | "prescriptions"
  | "messages"
  | "profile"
  | "rx"
  | "drug";

interface TopNavTab {
  id: RouteKey;
  label: string;
  icon: IconName;
  to: string;
}

const tabs: TopNavTab[] = [
  { id: "Dashboard",     label: "Dashboard",     icon: "home",          to: "/" },
  { id: "prescriptions", label: "Prescriptions", icon: "pill",          to: "/prescriptions" },
];

interface TopNavProps {
  active: RouteKey;
  patient: Patient;
  msgCount?: number;
}

export function TopNav({ active, patient, msgCount = 0 }: TopNavProps) {
  const nav = useNavigate();
  return (
    <nav className="topnav" aria-label="Primary">
      <Link to="/" className="brand" aria-label="Medico Pharmacy home">
        <img src={logo} alt="Medico Pharmacy" className="brand-logo" />
      </Link>
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <Link
            key={t.id}
            to={t.to}
            role="tab"
            aria-selected={active === t.id}
            className={`tab ${active === t.id ? "active" : ""}`}
          >
            <Icon name={t.icon} />
            {t.label}
          </Link>
        ))}
      </div>
      <div className="nav-right">
        <button className="icon-btn" aria-label="Messages" onClick={() => nav("/messages")} type="button">
          <Icon name="message-square" />
          {msgCount > 0 ? <span className="badge">{msgCount}</span> : null}
        </button>
        <button className="icon-btn" aria-label="Notifications" type="button">
          <Icon name="bell" />
        </button>
        <button
          className="avatar"
          onClick={() => nav("/profile")}
          type="button"
          aria-label={patient.name}
        >
          {patient.initials}
        </button>
      </div>
    </nav>
  );
}

// ────────────── PageHeader

export interface Crumb {
  label: ReactNode;
  onClick?: () => void;
  to?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  /** HTML allowed when string (matches `<b>` markers in the design copy). */
  sub?: ReactNode;
  action?: ReactNode;
  crumbs?: Crumb[];
}

export function PageHeader({ title, sub, action, crumbs }: PageHeaderProps) {
  return (
    <div>
      {crumbs && crumbs.length > 0 ? (
        <div className="crumbs">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <Fragment key={i}>
                {i > 0 ? <Icon name="chevron-right" /> : null}
                {last ? (
                  <span style={{ color: "var(--fg-1)" }}>{c.label}</span>
                ) : c.to ? (
                  <Link to={c.to}>{c.label}</Link>
                ) : c.onClick ? (
                  <a onClick={c.onClick}>{c.label}</a>
                ) : (
                  <span>{c.label}</span>
                )}
              </Fragment>
            );
          })}
        </div>
      ) : null}
      <header className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {sub
            ? typeof sub === "string"
              ? <p className="page-sub" dangerouslySetInnerHTML={{ __html: sub }} />
              : <p className="page-sub">{sub}</p>
            : null}
        </div>
        {action}
      </header>
    </div>
  );
}
