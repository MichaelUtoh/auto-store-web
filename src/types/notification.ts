export type NotificationType =
  | "ORDER"
  | "PROMOTION"
  | "SYSTEM"
  | "ACCOUNT"
  | string;

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  marketing: boolean;
}

export type NotificationPreferencesUpdate = Partial<NotificationPreferences>;
