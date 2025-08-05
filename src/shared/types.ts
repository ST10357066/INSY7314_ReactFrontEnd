import { z } from "zod";

// Address Schema
export const AddressSchema = z.object({
  street_address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state_province: z.string().min(1, "State/Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export type Address = z.infer<typeof AddressSchema>;

// KYC Document Schema
export const KYCDocumentSchema = z.object({
  type: z.enum(["passport", "national_id", "drivers_license", "utility_bill", "bank_statement"]),
  file_name: z.string(),
  file_url: z.string().url(),
  uploaded_at: z.string(),
  verified: z.boolean().default(false),
  verification_date: z.string().optional(),
});

export type KYCDocument = z.infer<typeof KYCDocumentSchema>;

// Notification Settings Schema
export const NotificationSettingsSchema = z.object({
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
  push_notifications: z.boolean().default(true),
  transaction_alerts: z.boolean().default(true),
  security_alerts: z.boolean().default(true),
  marketing_emails: z.boolean().default(false),
  weekly_reports: z.boolean().default(false),
});

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

// Privacy Settings Schema
export const PrivacySettingsSchema = z.object({
  profile_visibility: z.enum(["public", "private", "friends_only"]).default("private"),
  show_online_status: z.boolean().default(false),
  allow_data_sharing: z.boolean().default(false),
  allow_analytics: z.boolean().default(true),
  allow_cookies: z.boolean().default(true),
});

export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;

// User Preferences Schema
export const UserPreferencesSchema = z.object({
  language: z.enum(["en", "es", "fr", "de", "pt", "zh", "ja", "ko"]).default("en"),
  currency: z.enum(["USD", "EUR", "ZAR", "GBP", "JPY"]).default("USD"),
  timezone: z.string().default("UTC"),
  date_format: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).default("MM/DD/YYYY"),
  theme: z.enum(["light", "dark", "auto"]).default("light"),
  email_frequency: z.enum(["immediate", "daily", "weekly"]).default("immediate"),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// Enhanced User Profile Schema
export const UserProfileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  id_number: z.string().regex(/^[0-9]{13}$/, "ID number must be 13 digits"),
  account_number: z.string().regex(/^[0-9]{8,12}$/, "Account number must be 8-12 digits"),
  username: z.string().regex(/^[a-zA-Z0-9._-]{3,20}$/, "Username must be 3-20 characters"),
  // New fields
  profile_picture: z.string().url().optional(),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional(),
  phone_verified: z.boolean().default(false),
  date_of_birth: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  address: AddressSchema.optional(),
  kyc_documents: z.array(KYCDocumentSchema).default([]),
  account_verification_status: z.enum(["unverified", "pending", "verified", "rejected"]).default("unverified"),
  verification_notes: z.string().optional(),
  notification_settings: NotificationSettingsSchema.default({}),
  privacy_settings: PrivacySettingsSchema.default({}),
  user_preferences: UserPreferencesSchema.default({}),
});

export type UserProfile = z.infer<typeof UserProfileSchema> & {
  id: number;
  user_id: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
  account_status: "active" | "suspended" | "deleted";
  deletion_requested_at: string | null;
};

// Payment Schema
export const PaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive").multipleOf(0.01, "Amount can have at most 2 decimal places"),
  currency: z.enum(["USD", "EUR", "ZAR", "GBP", "JPY"]),
  recipient_account: z.string().min(1, "Recipient account is required"),
  swift_code: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, "Invalid SWIFT code format"),
  reference: z.string().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export type Transaction = {
  id: number;
  user_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  recipient_account: string;
  swift_code: string;
  status: "Pending" | "Verified" | "Sent" | "Failed";
  reference?: string;
  created_at: string;
  updated_at: string;
};

// Currency options
export const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "ZAR", label: "ZAR - South African Rand" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
] as const;

// Language options
export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "pt", label: "Português" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
] as const;

// Theme options
export const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" },
] as const;

// KYC Document types
export const KYC_DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "utility_bill", label: "Utility Bill" },
  { value: "bank_statement", label: "Bank Statement" },
] as const;

// Account Balance
export type AccountBalance = {
  available: number;
  pending: number;
  currency: string;
  last_updated: string;
};

// Transaction Analytics
export type TransactionAnalytics = {
  total_sent: number;
  total_received: number;
  monthly: Array<{ month: string; sent: number; received: number }>;
  categories: Array<{ category: string; amount: number }>;
  daily: Array<{ date: string; amount: number }>;
};

// Activity Feed
export type ActivityItem = {
  id: string;
  type: 'payment' | 'login' | 'profile_update' | 'kyc' | 'report' | 'other';
  description: string;
  created_at: string;
};

// Reports
export type MonthlyReport = {
  month: string;
  total_sent: number;
  total_received: number;
  transactions: number;
  tax_paid: number;
};

export type TaxReport = {
  year: string;
  total_taxable: number;
  total_tax_paid: number;
  details: Array<{ month: string; taxable: number; tax_paid: number }>;
};

export type CustomReport = {
  id: string;
  name: string;
  generated_at: string;
  data: any;
};

// Audit Log
export type AuditLogEntry = {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
};

// Notification System Types
export type NotificationType = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  category: 'transaction' | 'security' | 'account' | 'system' | 'marketing';
  data?: Record<string, any>;
  created_at: string;
  read_at?: string;
  sent_at?: string;
};

export type NotificationPreferences = {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  transaction_notifications: boolean;
  security_notifications: boolean;
  marketing_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
};

// Communication Types
export type MessageType = 'text' | 'file' | 'system';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ChatMessage = {
  id: string;
  user_id: string;
  agent_id?: string;
  type: MessageType;
  content: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
  is_from_user: boolean;
};

export type SupportTicket = {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: 'technical' | 'billing' | 'account' | 'transaction' | 'general';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  messages: ChatMessage[];
};

export type FAQ = {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
};

// Compliance & Legal Types
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type DocumentType = 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'proof_of_address';

export type IdentityVerification = {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_number: string;
  document_front_url: string;
  document_back_url?: string;
  selfie_url: string;
  status: VerificationStatus;
  verified_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
};

export type RiskAssessment = {
  id: string;
  user_id: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  factors: string[];
  assessment_date: string;
  next_review_date: string;
};

export type ComplianceReport = {
  id: string;
  report_type: 'kyc' | 'aml' | 'transaction' | 'risk';
  period_start: string;
  period_end: string;
  data: Record<string, any>;
  generated_at: string;
  status: 'pending' | 'completed' | 'failed';
};

export type TermsAcceptance = {
  id: string;
  user_id: string;
  terms_version: string;
  accepted_at: string;
  ip_address: string;
  user_agent: string;
};

export type PrivacyConsent = {
  id: string;
  user_id: string;
  consent_type: 'marketing' | 'analytics' | 'essential' | 'third_party';
  granted: boolean;
  granted_at?: string;
  revoked_at?: string;
  ip_address: string;
  user_agent: string;
};

export type DataExport = {
  id: string;
  user_id: string;
  export_type: 'profile' | 'transactions' | 'all';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  requested_at: string;
  completed_at?: string;
  expires_at: string;
};
