import {
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  BookUser,
  ChartColumn,
  CreditCard,
  QrCode,
  Receipt,
  Signal,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { ServiceAvailability, ServiceDefinition, ServiceIconKey } from "@/types/service";

const ICONS: Record<ServiceIconKey, LucideIcon> = {
  banknote: Banknote,
  smartphone: Smartphone,
  "qr-code": QrCode,
  signal: Signal,
  passport: BookUser,
  "credit-card": CreditCard,
  receipt: Receipt,
  "arrow-left-right": ArrowLeftRight,
  chart: ChartColumn,
};

const AVAILABILITY: Record<ServiceAvailability, { label: string; tone: "warning" | "info" | "neutral" }> = {
  demo_flow: { label: "Demo flow", tone: "warning" },
  guide: { label: "Guide", tone: "info" },
  not_available: { label: "Not in pilot", tone: "neutral" },
};

/** Icon tile for a service key. */
export function ServiceIcon({ icon, className }: { icon: ServiceIconKey; className?: string }) {
  const Icon = ICONS[icon];
  return (
    <span
      aria-hidden="true"
      className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong [&_svg]:size-5", className)}
    >
      <Icon />
    </span>
  );
}

/**
 * A service shortcut card. The whole card is one link to the service's own
 * page, and its availability label is always visible.
 */
export function ServiceCard({ service, compact = false }: { service: ServiceDefinition; compact?: boolean }) {
  const availability = AVAILABILITY[service.availability];
  return (
    <Link
      href={service.href}
      className={cn(
        "focus-ring group flex h-full gap-4 rounded-xl border border-border bg-surface shadow-card transition-[border-color,box-shadow,translate] duration-[var(--duration-base)]",
        "hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-raised",
        compact ? "items-center p-4" : "flex-col p-5",
      )}
    >
      <div className={cn("flex items-start justify-between gap-3", compact && "contents")}>
        <ServiceIcon icon={service.icon} />
        {!compact ? <Badge tone={availability.tone}>{availability.label}</Badge> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 font-semibold text-ink">
          {service.name}
          <ArrowUpRight
            className="size-4 text-brand opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </p>
        <p className={cn("type-caption mt-1 text-ink-muted", compact && "line-clamp-1")}>{service.summary}</p>
      </div>
    </Link>
  );
}
