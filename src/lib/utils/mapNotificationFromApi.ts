import type {
  Notification,
  NotificationPreferences,
  NotificationPreferencesUpdate,
} from "@/types/notification";
import { unwrapApiDataBody } from "@/lib/utils/mapUserFromApi";

type BackendNotification = {
  id: string;
  title?: string;
  message?: string;
  body?: string;
  type?: string;
  read?: boolean;
  is_read?: boolean;
  created_at?: string;
  createdAt?: string;
  action_url?: string;
  actionUrl?: string;
  href?: string;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

type BackendPreferences = {
  email_enabled?: boolean;
  emailEnabled?: boolean;
  push_enabled?: boolean;
  pushEnabled?: boolean;
  sms_enabled?: boolean;
  smsEnabled?: boolean;
  order_updates?: boolean;
  orderUpdates?: boolean;
  promotions?: boolean;
  marketing?: boolean;
};

function resolveNotificationHref(n: BackendNotification): string | undefined {
  if (n.actionUrl) return n.actionUrl;
  if (n.action_url) return n.action_url;
  if (n.href) return n.href;
  const payload = n.payload ?? n.metadata;
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    if (typeof p.href === "string") return p.href;
    if (n.type === "qa.answer_posted" && typeof p.question_id === "string") {
      const slug = p.slug ?? p.question_slug;
      if (typeof slug === "string") return `/q/${slug}`;
    }
  }
  return undefined;
}

export function mapNotificationFromApi(raw: unknown): Notification {
  const n = raw as BackendNotification;
  if (!n?.id) {
    throw new Error("Invalid notification payload from API");
  }
  return {
    id: n.id,
    title: (n.title ?? "Notification").trim(),
    message: (n.message ?? n.body ?? "").trim(),
    type: n.type ?? "SYSTEM",
    read: Boolean(n.read ?? n.is_read),
    createdAt: n.createdAt ?? n.created_at ?? new Date().toISOString(),
    actionUrl: resolveNotificationHref(n),
    metadata: n.metadata ?? (n.payload as Record<string, unknown> | undefined),
  };
}

export function mapNotificationsListFromApi(body: unknown): Notification[] {
  const unwrapped = unwrapApiDataBody(body);
  if (Array.isArray(unwrapped)) {
    return unwrapped.map(mapNotificationFromApi);
  }
  if (unwrapped && typeof unwrapped === "object") {
    const list =
      (unwrapped as { data?: unknown[] }).data ??
      (unwrapped as { notifications?: unknown[] }).notifications ??
      (unwrapped as { items?: unknown[] }).items;
    if (Array.isArray(list)) {
      return list.map(mapNotificationFromApi);
    }
  }
  return [];
}

export function mapUnreadCountFromApi(body: unknown): number {
  const unwrapped = unwrapApiDataBody(body);
  if (typeof unwrapped === "number") return Math.max(0, unwrapped);
  if (unwrapped && typeof unwrapped === "object") {
    const o = unwrapped as Record<string, unknown>;
    const count =
      o.count ?? o.unreadCount ?? o.unread_count ?? o.total ?? o.unread;
    if (typeof count === "number") return Math.max(0, count);
  }
  return 0;
}

export function mapNotificationPreferencesFromApi(
  raw: unknown
): NotificationPreferences {
  const p = (unwrapApiDataBody(raw) ?? {}) as BackendPreferences;
  return {
    emailEnabled: Boolean(p.emailEnabled ?? p.email_enabled ?? true),
    pushEnabled: Boolean(p.pushEnabled ?? p.push_enabled ?? false),
    smsEnabled: Boolean(p.smsEnabled ?? p.sms_enabled ?? false),
    orderUpdates: Boolean(p.orderUpdates ?? p.order_updates ?? true),
    promotions: Boolean(p.promotions ?? false),
    marketing: Boolean(p.marketing ?? false),
  };
}

export function notificationPreferencesToApi(
  payload: NotificationPreferencesUpdate
): Record<string, boolean> {
  const body: Record<string, boolean> = {};
  if (payload.emailEnabled !== undefined) {
    body.email_enabled = payload.emailEnabled;
  }
  if (payload.pushEnabled !== undefined) {
    body.push_enabled = payload.pushEnabled;
  }
  if (payload.smsEnabled !== undefined) {
    body.sms_enabled = payload.smsEnabled;
  }
  if (payload.orderUpdates !== undefined) {
    body.order_updates = payload.orderUpdates;
  }
  if (payload.promotions !== undefined) {
    body.promotions = payload.promotions;
  }
  if (payload.marketing !== undefined) {
    body.marketing = payload.marketing;
  }
  return body;
}
