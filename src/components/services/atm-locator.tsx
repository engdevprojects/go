"use client";

import { Banknote, Building2, Clock, Coins, MapPin, SearchX } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback-states";
import { SearchInput, Select } from "@/components/ui/form-controls";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/cn";
import { SAMPLE_CASH_POINTS } from "@/lib/mock-data/directory";
import type { CashPoint } from "@/types/service";

type KindFilter = "all" | CashPoint["kind"];
type NetworkFilter = "any" | "Visa" | "Mastercard";

const KIND_OPTIONS: readonly { value: KindFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "atm", label: "ATMs" },
  { value: "bureau", label: "Bureaux de change" },
  { value: "bank_branch", label: "Bank branches" },
];

const KIND_LABELS: Record<CashPoint["kind"], string> = { atm: "ATM", bureau: "Bureau de change", bank_branch: "Bank branch" };

function isNetworkFilter(value: string): value is NetworkFilter {
  return value === "any" || value === "Visa" || value === "Mastercard";
}

/**
 * Sample cash-access finder: search, type and card-network filters, a
 * schematic (not-to-scale) map with selectable markers, and location cards.
 */
export function AtmLocator() {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [network, setNetwork] = useState<NetworkFilter>("any");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const results = useMemo(() => {
    const needle = deferredSearch.trim().toLowerCase();
    return SAMPLE_CASH_POINTS.filter((point) => {
      if (kind !== "all" && point.kind !== kind) return false;
      if (network !== "any" && !point.networks.includes(network)) return false;
      return !needle || `${point.name} ${point.area} ${point.currencies.join(" ")}`.toLowerCase().includes(needle);
    });
  }, [deferredSearch, kind, network]);

  function clear() {
    setSearch("");
    setKind("all");
    setNetwork("any");
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
          <SearchInput id="cash-search" label="Search cash points" placeholder="Search by area or currency, e.g. Remera or EUR" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div>
            <label htmlFor="cash-network" className="sr-only">
              Card network
            </label>
            <Select
              id="cash-network"
              value={network}
              onChange={(event) => {
                if (isNetworkFilter(event.target.value)) setNetwork(event.target.value);
              }}
            >
              <option value="any">Any card network</option>
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
            </Select>
          </div>
        </div>
        <SegmentedControl label="Type" hideLabel name="cash-kind" size="sm" value={kind} options={KIND_OPTIONS} onChange={setKind} />
      </Card>

      <p className="px-1 text-sm text-ink-muted" aria-live="polite">
        <span className="font-semibold text-ink">{results.length}</span> sample {results.length === 1 ? "location" : "locations"}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card as="figure" padding="none" className="overflow-hidden lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-[4/3] bg-surface-muted">
            <svg aria-hidden="true" viewBox="0 0 100 75" className="absolute inset-0 size-full text-border-strong" preserveAspectRatio="none">
              <path d="M0 50 C20 40 30 60 50 48 S80 30 100 38" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M10 0 C25 25 35 35 30 75" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M60 0 C55 30 70 45 65 75" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            {results.map((point) => {
              const selected = point.id === selectedId;
              return (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setSelectedId(point.id)}
                  aria-pressed={selected}
                  aria-label={`${point.name}, ${point.area}`}
                  className={cn(
                    "focus-ring absolute flex size-9 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full transition-transform",
                    selected ? "z-10 scale-110 bg-brand text-ink-inverse shadow-raised" : "bg-surface text-brand-strong shadow-card hover:scale-105",
                  )}
                  style={{ left: `${point.mapPosition.x}%`, top: `${point.mapPosition.y}%` }}
                >
                  <MapPin className="size-5" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <figcaption className="type-caption border-t border-border px-4 py-3 text-ink-subtle">
            Schematic map, not to scale. Sample locations only — not verified and not live.
          </figcaption>
        </Card>

        {results.length === 0 ? (
          <Card>
            <EmptyState icon={<SearchX />} title="No sample locations match" description="Try another area or remove a filter." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} />
          </Card>
        ) : (
          <ul className="space-y-3">
            {results.map((point) => (
              <li key={point.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(point.id)}
                  aria-pressed={point.id === selectedId}
                  className={cn(
                    "focus-ring w-full rounded-lg border bg-surface p-5 text-left shadow-card transition-colors",
                    point.id === selectedId ? "border-brand ring-1 ring-brand" : "border-border hover:border-border-strong",
                  )}
                >
                  {/* Buttons may only contain phrasing content, so layout uses spans. */}
                  <span className="flex flex-wrap items-start justify-between gap-2">
                    <span className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-strong" aria-hidden="true">
                        {point.kind === "atm" ? <Banknote className="size-5" /> : point.kind === "bureau" ? <Coins className="size-5" /> : <Building2 className="size-5" />}
                      </span>
                      <span className="block">
                        <span className="block font-semibold text-ink">{point.name}</span>
                        <span className="type-caption block text-ink-muted">
                          {KIND_LABELS[point.kind]} · {point.area}
                        </span>
                      </span>
                    </span>
                    <Badge tone="warning">Sample</Badge>
                  </span>
                  <span className="mt-3 flex flex-wrap gap-1.5">
                    {point.networks.map((name) => (
                      <Badge key={name} tone="neutral">
                        {name}
                      </Badge>
                    ))}
                    {point.currencies.map((code) => (
                      <Badge key={code} tone="accent">
                        {code}
                      </Badge>
                    ))}
                  </span>
                  <span className="type-caption mt-3 flex items-center gap-1.5 text-ink-muted">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {point.hours}
                  </span>
                  <span className="type-caption mt-1 block text-ink-muted">{point.note}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
