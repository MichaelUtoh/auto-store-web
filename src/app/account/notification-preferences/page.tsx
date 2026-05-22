"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { notificationsApi } from "@/lib/api/notifications";
import type { NotificationPreferences } from "@/types/notification";
import toast from "react-hot-toast";

function PreferenceRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-muted/50 px-4 py-4">
      <div>
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        <p className="mt-1 text-xs text-secondary">{description}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 rounded border-border accent-primary"
      />
    </div>
  );
}

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    notificationsApi
      .getPreferences()
      .then(setPrefs)
      .catch(() => {
        toast.error("Could not load notification preferences.");
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (patch: Partial<NotificationPreferences>) => {
    if (!prefs) return;
    setPrefs({ ...prefs, ...patch });
  };

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      const updated = await notificationsApi.updatePreferences(prefs);
      setPrefs(updated);
      toast.success("Preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-secondary">
          Loading…
        </CardContent>
      </Card>
    );
  }

  if (!prefs) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-secondary">
          Unable to load preferences.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/account/notifications">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to notifications
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">
            Notification preferences
          </h2>
          <p className="text-sm text-secondary">
            Choose how you want to hear from us about orders and updates.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <PreferenceRow
            id="emailEnabled"
            label="Email notifications"
            description="Master switch for email alerts."
            checked={prefs.emailEnabled}
            onChange={(v) => update({ emailEnabled: v })}
          />
          <PreferenceRow
            id="orderUpdates"
            label="Order updates"
            description="Shipping, delivery, and order status changes."
            checked={prefs.orderUpdates}
            onChange={(v) => update({ orderUpdates: v })}
          />
          <PreferenceRow
            id="promotions"
            label="Promotions"
            description="Sales and special offers on parts."
            checked={prefs.promotions}
            onChange={(v) => update({ promotions: v })}
          />
          <PreferenceRow
            id="marketing"
            label="Marketing"
            description="Newsletters and product recommendations."
            checked={prefs.marketing}
            onChange={(v) => update({ marketing: v })}
          />
          <PreferenceRow
            id="pushEnabled"
            label="Push notifications"
            description="Browser or app push alerts when available."
            checked={prefs.pushEnabled}
            onChange={(v) => update({ pushEnabled: v })}
          />
          <PreferenceRow
            id="smsEnabled"
            label="SMS notifications"
            description="Text messages for urgent order updates."
            checked={prefs.smsEnabled}
            onChange={(v) => update({ smsEnabled: v })}
          />

          <Button
            type="button"
            className="mt-4 w-full sm:w-auto"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save preferences"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
