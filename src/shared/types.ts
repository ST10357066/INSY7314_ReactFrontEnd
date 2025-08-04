import { z } from "zod";

// User Profile Schema
export const UserProfileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  id_number: z.string().regex(/^[0-9]{13}$/, "ID number must be 13 digits"),
  account_number: z.string().regex(/^[0-9]{8,12}$/, "Account number must be 8-12 digits"),
  username: z.string().regex(/^[a-zA-Z0-9._-]{3,20}$/, "Username must be 3-20 characters"),
});

export type UserProfile = z.infer<typeof UserProfileSchema> & {
  id: number;
  user_id: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
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
