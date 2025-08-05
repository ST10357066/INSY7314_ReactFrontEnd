import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie } from "hono/cookie";
import { z } from "zod";

interface Env {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DB: any; // D1Database type from Cloudflare Workers
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Simple session management
const SESSION_TOKEN_COOKIE_NAME = 'session_token';

// Mock user data for demo
const mockUser = {
  id: '1',
  email: 'user@example.com',
  google_user_data: { given_name: 'John' },
  created_at: new Date().toISOString()
};

// Simple auth middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function authMiddleware(c: any, next: any) {
  const sessionToken = getCookie(c, SESSION_TOKEN_COOKIE_NAME);
  
  if (sessionToken) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c as any).set('user', mockUser);
  } else {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  await next();
}

// Get current user
app.get("/api/users/me", async (c) => {
  const sessionToken = getCookie(c, SESSION_TOKEN_COOKIE_NAME);
  
  if (sessionToken) {
    return c.json(mockUser);
  }
  
  return c.json({ error: "Unauthorized" }, 401);
});

// Login endpoint
app.post("/api/login", async (c) => {
  setCookie(c, SESSION_TOKEN_COOKIE_NAME, 'mock-session-token', {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true });
});

// Logout
app.get('/api/logout', async (c) => {
  setCookie(c, SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Enhanced User Profile Schema
const AddressSchema = z.object({
  street_address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state_province: z.string().min(1, "State/Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

const KYCDocumentSchema = z.object({
  type: z.enum(["passport", "national_id", "drivers_license", "utility_bill", "bank_statement"]),
  file_name: z.string(),
  file_url: z.string().url(),
  uploaded_at: z.string(),
  verified: z.boolean().default(false),
  verification_date: z.string().optional(),
});

const NotificationSettingsSchema = z.object({
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
  push_notifications: z.boolean().default(true),
  transaction_alerts: z.boolean().default(true),
  security_alerts: z.boolean().default(true),
  marketing_emails: z.boolean().default(false),
  weekly_reports: z.boolean().default(false),
});

const PrivacySettingsSchema = z.object({
  profile_visibility: z.enum(["public", "private", "friends_only"]).default("private"),
  show_online_status: z.boolean().default(false),
  allow_data_sharing: z.boolean().default(false),
  allow_analytics: z.boolean().default(true),
  allow_cookies: z.boolean().default(true),
});

const UserPreferencesSchema = z.object({
  language: z.enum(["en", "es", "fr", "de", "pt", "zh", "ja", "ko"]).default("en"),
  currency: z.enum(["USD", "EUR", "ZAR", "GBP", "JPY"]).default("USD"),
  timezone: z.string().default("UTC"),
  date_format: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).default("MM/DD/YYYY"),
  theme: z.enum(["light", "dark", "auto"]).default("light"),
  email_frequency: z.enum(["immediate", "daily", "weekly"]).default("immediate"),
});

const UserProfileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  id_number: z.string().regex(/^[0-9]{13}$/, "ID number must be 13 digits"),
  account_number: z.string().regex(/^[0-9]{8,12}$/, "Account number must be 8-12 digits"),
  username: z.string().regex(/^[a-zA-Z0-9._-]{3,20}$/, "Username must be 3-20 characters"),
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

// User profile endpoints
app.get("/api/profile", authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  
  // Mock profile data for demo with enhanced fields
  const mockProfile = {
    id: 1,
    user_id: user.id,
    full_name: "John Doe",
    id_number: "1234567890123",
    account_number: "12345678",
    username: "johndoe",
    profile_picture: "https://via.placeholder.com/150",
    phone_number: "+27123456789",
    phone_verified: true,
    date_of_birth: "1990-01-01",
    gender: "male",
    address: {
      street_address: "123 Main Street",
      city: "Cape Town",
      state_province: "Western Cape",
      postal_code: "8001",
      country: "South Africa",
    },
    kyc_documents: [
      {
        type: "passport",
        file_name: "passport.pdf",
        file_url: "https://example.com/passport.pdf",
        uploaded_at: new Date().toISOString(),
        verified: true,
        verification_date: new Date().toISOString(),
      },
      {
        type: "utility_bill",
        file_name: "utility_bill.pdf",
        file_url: "https://example.com/utility_bill.pdf",
        uploaded_at: new Date().toISOString(),
        verified: false,
      },
    ],
    account_verification_status: "verified",
    verification_notes: "All documents verified successfully",
    notification_settings: {
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      transaction_alerts: true,
      security_alerts: true,
      marketing_emails: false,
      weekly_reports: false,
    },
    privacy_settings: {
      profile_visibility: "private",
      show_online_status: false,
      allow_data_sharing: false,
      allow_analytics: true,
      allow_cookies: true,
    },
    user_preferences: {
      language: "en",
      currency: "USD",
      timezone: "UTC",
      date_format: "MM/DD/YYYY",
      theme: "light",
      email_frequency: "immediate",
    },
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    account_status: "active",
    deletion_requested_at: null,
  };

  return c.json(mockProfile);
});

app.post("/api/profile", authMiddleware, zValidator("json", UserProfileSchema), async (c) => {
  const profileData = c.req.valid("json");

  // In a real app, this would save to the database
  // For now, just return success
  return c.json({ success: true, data: profileData });
});

// Account deletion endpoint
app.post("/api/profile/delete", authMiddleware, async (c) => {
  // In a real app, this would mark the account for deletion or delete it
  // For now, just return success
  return c.json({ success: true, message: "Account marked for deletion" });
});

// Phone verification endpoint
app.post("/api/profile/verify-phone", authMiddleware, async (c) => {
  // In a real app, this would send an SMS verification code
  // For now, just return success
  return c.json({ success: true, message: "Verification code sent" });
});

// KYC document upload endpoint
app.post("/api/profile/kyc-upload", authMiddleware, async (c) => {
  // In a real app, this would handle file upload and storage
  // For now, just return success
  return c.json({ success: true, message: "Document uploaded successfully" });
});

// Transaction endpoints
const PaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive").multipleOf(0.01, "Amount can have at most 2 decimal places"),
  currency: z.enum(["USD", "EUR", "ZAR", "GBP", "JPY"]),
  recipient_account: z.string().min(1, "Recipient account is required"),
  swift_code: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, "Invalid SWIFT code format"),
  reference: z.string().optional(),
});

app.get("/api/transactions", authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  
  // Mock transaction data for demo
  const mockTransactions = [
    {
      id: 1,
      user_id: user.id,
      transaction_id: "TXN123456789",
      amount: 1000.00,
      currency: "USD",
      recipient_account: "12345678",
      swift_code: "ABCDEF12",
      status: "Sent",
      reference: "Payment for services",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return c.json(mockTransactions);
});

app.post("/api/transactions", authMiddleware, zValidator("json", PaymentSchema), async (c) => {
  const paymentData = c.req.valid("json");

  // Generate unique transaction ID
  const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // In a real app, this would save to the database
  // For now, just return success with transaction ID
  return c.json({ success: true, transaction_id: transactionId, data: paymentData });
});

// Account balance endpoint
app.get('/api/account/balance', authMiddleware, async (c) => {
  return c.json({
    available: 12500.75,
    pending: 500.00,
    currency: 'USD',
    last_updated: new Date().toISOString(),
  });
});

// Transaction analytics endpoint
app.get('/api/transactions/analytics', authMiddleware, async (c) => {
  return c.json({
    total_sent: 25000,
    total_received: 12000,
    monthly: [
      { month: '2024-01', sent: 2000, received: 1000 },
      { month: '2024-02', sent: 3000, received: 1200 },
      { month: '2024-03', sent: 4000, received: 1500 },
      { month: '2024-04', sent: 5000, received: 2000 },
    ],
    categories: [
      { category: 'Rent', amount: 8000 },
      { category: 'Salary', amount: 12000 },
      { category: 'Utilities', amount: 3000 },
    ],
    daily: [
      { date: '2024-04-01', amount: 500 },
      { date: '2024-04-02', amount: 700 },
      { date: '2024-04-03', amount: 1200 },
    ],
  });
});

// Activity feed endpoint
app.get('/api/activity', authMiddleware, async (c) => {
  return c.json([
    { id: '1', type: 'payment', description: 'Sent $500 to John', created_at: new Date().toISOString() },
    { id: '2', type: 'login', description: 'Logged in from new device', created_at: new Date().toISOString() },
    { id: '3', type: 'kyc', description: 'Uploaded passport for KYC', created_at: new Date().toISOString() },
  ]);
});

// Monthly report endpoint
app.get('/api/reports/monthly', authMiddleware, async (c) => {
  return c.json({
    month: '2024-04',
    total_sent: 5000,
    total_received: 2000,
    transactions: 12,
    tax_paid: 150,
  });
});

// Tax report endpoint
app.get('/api/reports/tax', authMiddleware, async (c) => {
  return c.json({
    year: '2024',
    total_taxable: 24000,
    total_tax_paid: 1800,
    details: [
      { month: '2024-01', taxable: 2000, tax_paid: 150 },
      { month: '2024-02', taxable: 3000, tax_paid: 200 },
    ],
  });
});

// Custom report endpoint
app.get('/api/reports/custom', authMiddleware, async (c) => {
  return c.json({
    id: 'custom-1',
    name: 'My Custom Report',
    generated_at: new Date().toISOString(),
    data: { note: 'This is a custom report.' },
  });
});

// Audit log endpoint
app.get('/api/audit-log', authMiddleware, async (c) => {
  return c.json([
    { id: '1', user_id: '1', action: 'login', details: 'User logged in', created_at: new Date().toISOString() },
    { id: '2', user_id: '1', action: 'payment', details: 'Sent $500 to John', created_at: new Date().toISOString() },
    { id: '3', user_id: '1', action: 'kyc', details: 'Uploaded passport', created_at: new Date().toISOString() },
  ]);
});

// Notification endpoints
app.get('/api/notifications', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  
  const mockNotifications = [
    {
      id: '1',
      user_id: user.id,
      type: 'in_app',
      title: 'Payment Successful',
      message: 'Your payment of $500 has been processed successfully.',
      priority: 'medium',
      status: 'unread',
      category: 'transaction',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: user.id,
      type: 'email',
      title: 'Account Verification Required',
      message: 'Please complete your identity verification to continue using our services.',
      priority: 'high',
      status: 'unread',
      category: 'security',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      user_id: user.id,
      type: 'push',
      title: 'New Feature Available',
      message: 'Check out our new dashboard analytics features!',
      priority: 'low',
      status: 'read',
      category: 'marketing',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      read_at: new Date().toISOString(),
    },
  ];

  return c.json(mockNotifications);
});

app.post('/api/notifications/:id/read', authMiddleware, async (c) => {
  // In a real app, this would update the notification status
  return c.json({ success: true });
});

app.post('/api/notifications/:id/archive', authMiddleware, async (c) => {
  // In a real app, this would archive the notification
  return c.json({ success: true });
});

app.post('/api/notifications/settings', authMiddleware, async (c) => {
  // In a real app, this would save notification settings
  return c.json({ success: true });
});

// Chat endpoints
app.get('/api/chat/history', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  
  const mockChatHistory = [
    {
      id: '1',
      user_id: user.id,
      type: 'text',
      content: 'Hello, I need help with my account verification.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      is_from_user: true,
    },
    {
      id: '2',
      user_id: user.id,
      agent_id: 'support-agent-1',
      type: 'text',
      content: 'Hello! I\'d be happy to help you with your account verification. Can you please provide more details about what you\'re experiencing?',
      created_at: new Date(Date.now() - 3500000).toISOString(),
      is_from_user: false,
    },
  ];

  return c.json(mockChatHistory);
});

app.post('/api/chat/send', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  const messageData = await c.req.json();
  
  const newMessage = {
    id: `msg-${Date.now()}`,
    user_id: user.id,
    ...messageData,
    created_at: new Date().toISOString(),
  };

  return c.json(newMessage);
});

// Support Ticket endpoints
app.get('/api/support/tickets', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  
  const mockTickets = [
    {
      id: 'TICKET-001',
      user_id: user.id,
      subject: 'Account Verification Issue',
      description: 'I\'m having trouble uploading my ID documents for verification.',
      status: 'open',
      priority: 'high',
      category: 'account',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          id: 'msg-1',
          user_id: user.id,
          type: 'text',
          content: 'I\'m having trouble uploading my ID documents for verification.',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          is_from_user: true,
        },
        {
          id: 'msg-2',
          user_id: user.id,
          agent_id: 'support-agent-1',
          type: 'text',
          content: 'Thank you for contacting us. Can you please describe the specific error you\'re encountering?',
          created_at: new Date(Date.now() - 82800000).toISOString(),
          is_from_user: false,
        },
      ],
    },
    {
      id: 'TICKET-002',
      user_id: user.id,
      subject: 'Payment Processing Delay',
      description: 'My international payment has been pending for 3 days.',
      status: 'in_progress',
      priority: 'medium',
      category: 'transaction',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      messages: [
        {
          id: 'msg-3',
          user_id: user.id,
          type: 'text',
          content: 'My international payment has been pending for 3 days.',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          is_from_user: true,
        },
      ],
    },
  ];

  return c.json(mockTickets);
});

app.post('/api/support/tickets', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  const ticketData = await c.req.json();
  
  const newTicket = {
    id: `TICKET-${Date.now()}`,
    user_id: user.id,
    ...ticketData,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [
      {
        id: `msg-${Date.now()}`,
        user_id: user.id,
        type: 'text',
        content: ticketData.description,
        created_at: new Date().toISOString(),
        is_from_user: true,
      },
    ],
  };

  return c.json(newTicket);
});

app.post('/api/support/tickets/:id/messages', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  const messageData = await c.req.json();
  
  const newMessage = {
    id: `msg-${Date.now()}`,
    user_id: user.id,
    type: 'text',
    content: messageData.content,
    created_at: new Date().toISOString(),
    is_from_user: true,
  };

  return c.json(newMessage);
});

// FAQ endpoints
app.get('/api/faq', async (c) => {
  const mockFAQs = [
    {
      id: '1',
      category: 'account',
      question: 'How do I verify my account?',
      answer: 'To verify your account, please upload a valid government-issued ID and proof of address. You can do this in your Profile settings under the KYC Documents section.',
      tags: ['verification', 'kyc', 'account'],
      helpful_count: 45,
      not_helpful_count: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      category: 'payments',
      question: 'How long do international transfers take?',
      answer: 'Most international transfers are processed within 1-3 business days. Processing times may vary depending on the destination country and banking hours.',
      tags: ['transfers', 'timing', 'international'],
      helpful_count: 32,
      not_helpful_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      category: 'security',
      question: 'Is my money safe with SecurePay?',
      answer: 'Yes, your money is protected by bank-grade security measures including encryption, multi-factor authentication, and compliance with international banking standards.',
      tags: ['security', 'safety', 'protection'],
      helpful_count: 28,
      not_helpful_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      category: 'billing',
      question: 'What are the transfer fees?',
      answer: 'Transfer fees vary by destination and amount, typically ranging from 0.5% to 2.0% of the transfer amount. You can see the exact fee before confirming your transfer.',
      tags: ['fees', 'costs', 'pricing'],
      helpful_count: 19,
      not_helpful_count: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return c.json(mockFAQs);
});

app.post('/api/faq/:id/vote', async (c) => {
  // In a real app, this would update the vote counts
  return c.json({ success: true });
});

// Identity Verification endpoints
app.post('/api/verification/identity', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  const verificationData = await c.req.json();
  
  // In a real app, this would process identity verification
  const verification = {
    id: `verification-${Date.now()}`,
    user_id: user.id,
    ...verificationData,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return c.json(verification);
});

app.get('/api/verification/status', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  
  const mockVerification = {
    id: 'verification-001',
    user_id: user.id,
    document_type: 'passport',
    document_number: '123456789',
    document_front_url: 'https://example.com/passport-front.jpg',
    selfie_url: 'https://example.com/selfie.jpg',
    status: 'pending',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  return c.json(mockVerification);
});

// Risk Assessment endpoints
app.get('/api/risk/assessment', authMiddleware, async (c) => {
  const mockRiskAssessment = {
    id: 'risk-001',
    user_id: '1',
    risk_score: 25,
    risk_level: 'low',
    factors: ['Verified account', 'Regular transaction patterns', 'No suspicious activity'],
    assessment_date: new Date().toISOString(),
    next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return c.json(mockRiskAssessment);
});

// Compliance Report endpoints
app.get('/api/compliance/reports', authMiddleware, async (c) => {
  const mockReports = [
    {
      id: 'report-001',
      report_type: 'kyc',
      period_start: '2024-01-01',
      period_end: '2024-01-31',
      data: {
        total_verifications: 150,
        approved: 142,
        rejected: 8,
        pending: 0,
      },
      generated_at: new Date().toISOString(),
      status: 'completed',
    },
    {
      id: 'report-002',
      report_type: 'transaction',
      period_start: '2024-01-01',
      period_end: '2024-01-31',
      data: {
        total_transactions: 1250,
        total_volume: 2500000,
        average_transaction: 2000,
        suspicious_transactions: 3,
      },
      generated_at: new Date().toISOString(),
      status: 'completed',
    },
  ];

  return c.json(mockReports);
});

// Terms Acceptance endpoints
app.post('/api/legal/terms/accept', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  const acceptanceData = await c.req.json();
  
  const acceptance = {
    id: `acceptance-${Date.now()}`,
    user_id: user.id,
    terms_version: acceptanceData.version || '1.0',
    accepted_at: new Date().toISOString(),
    ip_address: '192.168.1.1', // In real app, get from request
    user_agent: 'Mozilla/5.0...', // In real app, get from request
  };

  return c.json(acceptance);
});

app.get('/api/legal/terms/status', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  
  const mockAcceptance = {
    id: 'acceptance-001',
    user_id: user.id,
    terms_version: '1.0',
    accepted_at: new Date(Date.now() - 86400000).toISOString(),
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0...',
  };

  return c.json(mockAcceptance);
});

// Privacy Consent endpoints
app.post('/api/legal/privacy/consent', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  const consentData = await c.req.json();
  
  const consent = {
    id: `consent-${Date.now()}`,
    user_id: user.id,
    consent_type: consentData.type,
    granted: consentData.granted,
    granted_at: consentData.granted ? new Date().toISOString() : undefined,
    revoked_at: !consentData.granted ? new Date().toISOString() : undefined,
    ip_address: '192.168.1.1', // In real app, get from request
    user_agent: 'Mozilla/5.0...', // In real app, get from request
  };

  return c.json(consent);
});

app.get('/api/legal/privacy/consents', authMiddleware, async (c) => {
  const mockConsents = [
    {
      id: 'consent-001',
      user_id: '1',
      consent_type: 'essential',
      granted: true,
      granted_at: new Date(Date.now() - 86400000).toISOString(),
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
    },
    {
      id: 'consent-002',
      user_id: '1',
      consent_type: 'marketing',
      granted: false,
      revoked_at: new Date(Date.now() - 43200000).toISOString(),
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
    },
  ];

  return c.json(mockConsents);
});

// Data Export endpoints
app.post('/api/data/export', authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  const exportData = await c.req.json();
  
  const exportRequest = {
    id: `export-${Date.now()}`,
    user_id: user.id,
    export_type: exportData.type || 'all',
    status: 'pending',
    requested_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };

  return c.json(exportRequest);
});

app.get('/api/data/export/:id', authMiddleware, async (c) => {
  const exportId = c.req.param('id');
  
  const mockExport = {
    id: exportId,
    user_id: '1',
    export_type: 'all',
    status: 'completed',
    file_url: 'https://example.com/exports/user-data-2024-01-01.zip',
    requested_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return c.json(mockExport);
});

export default app;
