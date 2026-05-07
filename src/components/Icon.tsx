// Tiny icon adapter: keeps the original kebab-case `name` API used by the
// design's prototype (e.g. `<Icon name="pill" />`) while rendering through
// lucide-react. Only icons actually used in the portal are wired up.

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bandage,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  Citrus,
  CreditCard,
  Download,
  Droplet,
  Edit2,
  Eye,
  EyeOff,
  Flag,
  FlaskConical,
  Globe,
  Headphones,
  HeartPulse,
  Home,
  Info,
  Leaf,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Minus,
  Package,
  Phone,
  Pill as PillIcon,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  Thermometer,
  Truck,
  User,
  UserCheck,
  X,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType, CSSProperties } from "react";

export type IconName =
  | "activity"
  | "alert-triangle"
  | "arrow-left"
  | "arrow-right"
  | "bandage"
  | "bell"
  | "calendar"
  | "check"
  | "check-circle"
  | "chevron-right"
  | "citrus"
  | "credit-card"
  | "download"
  | "droplet"
  | "edit-2"
  | "eye"
  | "eye-off"
  | "flag"
  | "flask-conical"
  | "globe"
  | "headphones"
  | "heart-pulse"
  | "home"
  | "info"
  | "leaf"
  | "lock"
  | "log-out"
  | "mail"
  | "map-pin"
  | "message-square"
  | "minus"
  | "package"
  | "phone"
  | "pill"
  | "plus"
  | "refresh-cw"
  | "search"
  | "send"
  | "shield"
  | "shield-check"
  | "shopping-bag"
  | "shopping-cart"
  | "smartphone"
  | "sparkles"
  | "star"
  | "stethoscope"
  | "thermometer"
  | "truck"
  | "user"
  | "user-check"
  | "x";

const map: Record<IconName, ComponentType<LucideProps>> = {
  "activity": Activity,
  "alert-triangle": AlertTriangle,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "bandage": Bandage,
  "bell": Bell,
  "calendar": Calendar,
  "check": Check,
  "check-circle": CheckCircle,
  "chevron-right": ChevronRight,
  "citrus": Citrus,
  "credit-card": CreditCard,
  "download": Download,
  "droplet": Droplet,
  "edit-2": Edit2,
  "eye": Eye,
  "eye-off": EyeOff,
  "flag": Flag,
  "flask-conical": FlaskConical,
  "globe": Globe,
  "headphones": Headphones,
  "heart-pulse": HeartPulse,
  "home": Home,
  "info": Info,
  "leaf": Leaf,
  "lock": Lock,
  "log-out": LogOut,
  "mail": Mail,
  "map-pin": MapPin,
  "message-square": MessageSquare,
  "minus": Minus,
  "package": Package,
  "phone": Phone,
  "pill": PillIcon,
  "plus": Plus,
  "refresh-cw": RefreshCw,
  "search": Search,
  "send": Send,
  "shield": Shield,
  "shield-check": ShieldCheck,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingCart,
  "smartphone": Smartphone,
  "sparkles": Sparkles,
  "star": Star,
  "stethoscope": Stethoscope,
  "thermometer": Thermometer,
  "truck": Truck,
  "user": User,
  "user-check": UserCheck,
  "x": X,
};

interface IconProps {
  name: IconName;
  className?: string;
  style?: CSSProperties;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, className = "lu", style, size, strokeWidth }: IconProps) {
  const C = map[name];
  if (!C) return null;
  return <C className={className} style={style} size={size} strokeWidth={strokeWidth} />;
}
