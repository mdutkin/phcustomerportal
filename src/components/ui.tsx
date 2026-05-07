// Atoms and small composed components — Button, Pill, Banner, Card,
// StatTile, Field, Seg, Modal, Sparkline, MiniCalendar, ToastStack.

import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  useEffect,
} from "react";
import { Icon, type IconName } from "./Icon";

// ────────────── Button
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "lg" | "";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
}

export function Button({
  variant = "primary",
  size = "",
  block,
  children,
  leadingIcon,
  trailingIcon,
  className,
  ...rest
}: ButtonProps) {
  const cls = [
    "btn",
    `btn-${variant}`,
    size && `btn-${size}`,
    block && "btn-block",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={cls} {...rest}>
      {leadingIcon ? <Icon name={leadingIcon} /> : null}
      {children}
      {trailingIcon ? <Icon name={trailingIcon} /> : null}
    </button>
  );
}

// ────────────── Pill
export type PillTone = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

interface PillProps {
  tone?: PillTone;
  icon?: IconName;
  children: ReactNode;
}

export function Pill({ tone = "neutral", icon, children }: PillProps) {
  return (
    <span className={`pill pill-${tone}`}>
      {icon ? <Icon name={icon} /> : <span className="dot" />}
      {children}
    </span>
  );
}

// ────────────── Banner
export type BannerTone = "info" | "success" | "warning" | "danger";

interface BannerProps {
  tone?: BannerTone;
  icon?: IconName;
  title: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
  action?: ReactNode;
}

export function Banner({ tone = "info", icon = "info", title, children, onDismiss, action }: BannerProps) {
  return (
    <div className={`banner banner-${tone}`}>
      <span className="banner-icon">
        <Icon name={icon} />
      </span>
      <span>
        <b>{title}</b> {children}
      </span>
      <span className="banner-spacer" />
      {action}
      {onDismiss ? (
        <button className="icon-btn" onClick={onDismiss} aria-label="Dismiss">
          <Icon name="x" />
        </button>
      ) : null}
    </div>
  );
}

// ────────────── Card
interface CardProps {
  title?: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  padded?: boolean;
  footer?: ReactNode;
}

export function Card({ title, sub, action, children, padded = false, footer }: CardProps) {
  return (
    <section className="card">
      {(title || action) && (
        <header className="card-header">
          <div>
            {title ? <h3 className="card-title">{title}</h3> : null}
            {sub ? <p className="card-sub">{sub}</p> : null}
          </div>
          {action}
        </header>
      )}
      <div className={padded ? "card-body card-body--padded" : "card-body"}>{children}</div>
      {footer ? <div className="card-footer">{footer}</div> : null}
    </section>
  );
}

// ────────────── StatTile
interface StatTileProps {
  icon: IconName;
  iconTone?: "brand" | "warning" | "info" | "success" | "danger";
  label: string;
  value: ReactNode;
  /** HTML allowed — `<b>` segments are styled per the design. */
  sub?: string;
  onClick?: () => void;
}

export function StatTile({ icon, iconTone = "brand", label, value, sub, onClick }: StatTileProps) {
  return (
    <button className="stat" onClick={onClick} type="button">
      <span className={`stat-icon tone-${iconTone}`}>
        <Icon name={icon} />
      </span>
      <span className="stat-label">{label}</span>
      <span className="stat-num tabular">{value}</span>
      {sub ? <span className="stat-sub" dangerouslySetInnerHTML={{ __html: sub }} /> : null}
    </button>
  );
}

// ────────────── Field
interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="field">
      {label ? <label className="field-label">{label}</label> : null}
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

// ────────────── Segmented control
interface SegOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: IconName;
}
interface SegProps<T extends string> {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  block?: boolean;
}

export function Seg<T extends string>({ options, value, onChange, block }: SegProps<T>) {
  const style: CSSProperties | undefined = block ? { width: "100%" } : undefined;
  return (
    <div className="seg" style={style}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`seg-opt ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon ? <Icon name={opt.icon} /> : null}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ────────────── Modal
interface ModalProps {
  title: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  footer?: ReactNode;
  size?: "lg";
}

export function Modal({ title, children, onClose, footer, size }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="scrim" onClick={onClose}>
      <div
        className={`modal ${size === "lg" ? "modal-lg" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <h2 className="modal-title">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

// ────────────── Sparkline
interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ values, width = 220, height = 64 }: SparklineProps) {
  if (!values || !values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 6;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const span = max - min || 1;
  const pts = values.map((v, i): [number, number] => {
    const x = pad + (i / (values.length - 1)) * w;
    const y = pad + (1 - (v - min) / span) * h;
    return [x, y];
  });
  const path = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--brand-primary)" />
    </svg>
  );
}

// ────────────── Calendar (current month, future days clickable)
interface MiniCalendarProps {
  value: Date | null;
  onChange: (d: Date) => void;
  monthOffset?: number;
  todayDate: Date;
}

export function MiniCalendar({ value, onChange, monthOffset = 0, todayDate }: MiniCalendarProps) {
  const today = todayDate;
  const year = today.getFullYear();
  const month = today.getMonth() + monthOffset;
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = first.getDay();
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  const monthName = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const isSame = (a: Date | null, b: Date | null) =>
    !!a && !!b && a.toDateString() === b.toDateString();
  const isPast = (d: Date | null) => !!d && d < new Date(today.toDateString());

  return (
    <div className="cal">
      <div className="cal-head">
        <span>{monthName}</span>
      </div>
      <div className="cal-grid">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="cal-dow">{d}</div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const past = isPast(d);
          const sel = isSame(d, value);
          const tdy = isSame(d, today);
          return (
            <button
              key={i}
              type="button"
              className={`cal-day ${past ? "disabled" : ""} ${sel ? "selected" : ""} ${tdy && !sel ? "today" : ""}`}
              disabled={past}
              onClick={() => onChange(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ────────────── Toast stack
export interface Toast {
  id: string;
  text: ReactNode;
}
interface ToastStackProps {
  toasts: Toast[];
}

export function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <Icon name="check-circle" /> {t.text}
        </div>
      ))}
    </div>
  );
}
