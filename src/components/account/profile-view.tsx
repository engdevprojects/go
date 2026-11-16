"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AccountNav } from "@/components/account/account-nav";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { describedBy, FormField, Input, Select, Switch } from "@/components/ui/form-controls";
import { Avatar, DetailRow } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { TIER_LIMITS } from "@/lib/config/product";
import { formatDate } from "@/lib/dates";
import { CURRENCY_NAMES } from "@/lib/money";
import { COUNTRY_OPTIONS } from "@/lib/mock-data/profile";
import { FOREIGN_CURRENCIES, isForeignCurrency } from "@/lib/mock-data/rates";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import { profileSchema, type ProfileValues } from "@/lib/validation/account";
import type { AccountPreferences } from "@/types/profile";

const PREFERENCE_SWITCHES: readonly { key: keyof Pick<AccountPreferences, "emailReceipts" | "spendAlerts" | "expiryReminders" | "productNews">; label: string; description: string }[] = [
  { key: "emailReceipts", label: "Email receipts", description: "A receipt for each top-up and payment (not sent in the demo)." },
  { key: "spendAlerts", label: "Spending alerts", description: "Notify me about payments and transfers." },
  { key: "expiryReminders", label: "Expiry reminders", description: "Reminders on day 25 and day 29 of the wallet period." },
  { key: "productNews", label: "Product news", description: "Occasional updates about new services." },
];

/** Profile, editable details, preferences, account navigation and sign-out. */
export function ProfileView() {
  const toast = useToast();
  const { profile, data } = useDemoStore();
  const { updateProfile, updatePreferences, signOut } = useDemoActions();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const preferences = data.preferences;
  const fullName = `${profile.givenName} ${profile.familyName}`;
  const country = COUNTRY_OPTIONS.find((option) => option.code === profile.countryCode)?.name ?? profile.countryCode;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { givenName: profile.givenName, familyName: profile.familyName, countryCode: profile.countryCode },
  });

  async function onSubmit(values: ProfileValues) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateProfile(values);
    reset(values);
    toast({ tone: "success", title: "Profile updated", description: "Saved in this browser only." });
  }

  function setPreference<Key extends keyof AccountPreferences>(key: Key, value: AccountPreferences[Key]) {
    updatePreferences({ ...preferences, [key]: value });
  }

  /** Ends the demo session; the app shell's guard then sends the visitor home. */
  function handleSignOut() {
    signOut();
  }

  return (
    <>
      <PageHeader title="Profile" description="Your demo account details and preferences." breadcrumbs={[{ label: "Account" }]} />

      <div className="space-y-6">
        <Card as="section" aria-labelledby="summary-heading">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar name={fullName} size="lg" />
            <div className="min-w-0 flex-1">
              <h2 id="summary-heading" className="type-section-title text-ink">
                {fullName}
              </h2>
              <p className="type-caption break-all text-ink-muted">{profile.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="success" icon={<BadgeCheck aria-hidden="true" />}>
                  {TIER_LIMITS[profile.tier].label} tier
                </Badge>
                <DemoBadge label="Demo account" />
              </div>
            </div>
          </div>
          <dl className="mt-5 grid gap-x-8 divide-y divide-border sm:grid-cols-2 sm:divide-y-0">
            <DetailRow label="Country of residence" value={country} />
            <DetailRow label="Passport" value={profile.maskedPassport} />
            <DetailRow label="Member since" value={formatDate(profile.memberSince)} />
            <DetailRow label="Verification" value="Complete (demo)" />
          </dl>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card as="section" aria-labelledby="edit-heading">
            <CardHeader id="edit-heading" title="Personal details" description="Name changes would normally need to match your passport." />
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="givenName" label="First name" error={errors.givenName?.message}>
                  <Input id="givenName" autoComplete="given-name" invalid={Boolean(errors.givenName)} aria-describedby={describedBy("givenName", false, errors.givenName)} {...register("givenName")} />
                </FormField>
                <FormField id="familyName" label="Last name" error={errors.familyName?.message}>
                  <Input id="familyName" autoComplete="family-name" invalid={Boolean(errors.familyName)} aria-describedby={describedBy("familyName", false, errors.familyName)} {...register("familyName")} />
                </FormField>
              </div>
              <FormField id="countryCode" label="Country of residence" error={errors.countryCode?.message}>
                <Select id="countryCode" invalid={Boolean(errors.countryCode)} {...register("countryCode")}>
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField id="email-readonly" label="Email" hint="Your email is your sign-in and can't be changed here.">
                <Input id="email-readonly" value={profile.email} readOnly disabled aria-describedby="email-readonly-hint" />
              </FormField>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" loading={isSubmitting} loadingLabel="Saving…" disabled={!isDirty}>
                  Save changes
                </Button>
                <Button variant="ghost" onClick={() => reset()} disabled={!isDirty || isSubmitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>

          <Card as="section" aria-labelledby="prefs-heading">
            <CardHeader id="prefs-heading" title="Preferences" description="Saved automatically in this browser" />
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="home-currency" label="Home currency" hint="Used for balance equivalents and quotes.">
                  <Select
                    id="home-currency"
                    value={preferences.homeCurrency}
                    aria-describedby="home-currency-hint"
                    onChange={(event) => {
                      if (isForeignCurrency(event.target.value)) setPreference("homeCurrency", event.target.value);
                    }}
                  >
                    {FOREIGN_CURRENCIES.map((code) => (
                      <option key={code} value={code}>
                        {code} · {CURRENCY_NAMES[code]}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField id="language" label="Language" hint="French is planned; the demo is in English.">
                  <Select
                    id="language"
                    value={preferences.language}
                    aria-describedby="language-hint"
                    onChange={(event) => setPreference("language", event.target.value === "fr" ? "fr" : "en")}
                  >
                    <option value="en">English</option>
                    <option value="fr">Français (planned)</option>
                  </Select>
                </FormField>
              </div>
              {/* Notification preferences — collapsible secondary section */}
              <details className="group border-t border-border pt-4">
                <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-sm py-1 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  Notification preferences
                  <ChevronDown className="size-4 text-ink-subtle transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="mt-4 space-y-4">
                  {PREFERENCE_SWITCHES.map((item) => (
                    <Switch
                      key={item.key}
                      id={`pref-${item.key}`}
                      checked={preferences[item.key]}
                      onCheckedChange={(checked) => setPreference(item.key, checked)}
                      label={item.label}
                      description={item.description}
                    />
                  ))}
                </div>
              </details>
            </div>
          </Card>
        </div>

        <div className="lg:hidden">
          <AccountNav variant="list" />
        </div>

        <Card as="section" aria-labelledby="signout-heading" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="signout-heading" className="type-card-title text-ink">
              Sign out
            </h2>
            <p className="type-caption text-ink-muted">Ends the demo session and clears everything this demo saved in your browser.</p>
          </div>
          <Button variant="outline" onClick={() => setConfirmSignOut(true)}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmSignOut}
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={handleSignOut}
        title="Sign out of the demo?"
        description="Demo transactions, notes and preferences saved in this browser will be cleared. The sample data will be back next time you sign in."
        confirmLabel="Sign out"
        tone="danger"
      />
    </>
  );
}
