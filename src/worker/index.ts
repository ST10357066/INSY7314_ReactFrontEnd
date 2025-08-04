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

// User profile endpoints
const UserProfileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  id_number: z.string().regex(/^[0-9]{13}$/, "ID number must be 13 digits"),
  account_number: z.string().regex(/^[0-9]{8,12}$/, "Account number must be 8-12 digits"),
  username: z.string().regex(/^[a-zA-Z0-9._-]{3,20}$/, "Username must be 3-20 characters"),
});

app.get("/api/profile", authMiddleware, async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user");
  
  // Mock profile data for demo
  const mockProfile = {
    id: 1,
    user_id: user.id,
    full_name: "John Doe",
    id_number: "1234567890123",
    account_number: "12345678",
    username: "johndoe",
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return c.json(mockProfile);
});

app.post("/api/profile", authMiddleware, zValidator("json", UserProfileSchema), async (c) => {
  const profileData = c.req.valid("json");

  // In a real app, this would save to the database
  // For now, just return success
  return c.json({ success: true, data: profileData });
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

export default app;
