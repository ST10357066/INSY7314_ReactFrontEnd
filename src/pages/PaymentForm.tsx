import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FormField, Input, Select } from "@/components/FormField";
import { ConfirmDialog } from "@/components/Dialog";
import Dialog from "@/components/Dialog";
import { PaymentSchema, CURRENCIES } from "@/shared/types";
import { z } from "zod";

export default function PaymentForm() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    recipient_account: "",
    swift_code: "",
    reference: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/login");
    }
  }, [user, isPending, navigate]);

  const validateForm = () => {
    try {
      const parsedData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
      };
      PaymentSchema.parse(parsedData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    try {
      const parsedData = {
        ...formData,
        amount: parseFloat(formData.amount),
        reference: formData.reference || undefined,
      };

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      if (response.ok) {
        const result = await response.json();
        setTransactionId(result.transaction_id);
        setShowSuccessDialog(true);
        // Reset form
        setFormData({
          amount: "",
          currency: "USD",
          recipient_account: "",
          swift_code: "",
          reference: "",
        });
      } else {
        const errorData = await response.json();
        console.error("Payment failed:", errorData);
      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    if (!amount) return "";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "";
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(numAmount);
  };

  if (isPending) {
    return (
      <Layout showSidebar>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout showSidebar>
      <div className="p-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">New Payment</h1>
          <p className="text-slate-600">
            Send money internationally with our secure payment system.
          </p>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="Amount"
                error={errors.amount}
                required
                success={parseFloat(formData.amount) > 0 && !errors.amount}
              >
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("amount", e.target.value)}
                  placeholder="0.00"
                  error={!!errors.amount}
                />
              </FormField>

              <FormField
                label="Currency"
                error={errors.currency}
                required
              >
                <Select
                  value={formData.currency}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange("currency", e.target.value)}
                  options={CURRENCIES.map(c => ({ value: c.value, label: c.label }))}
                  error={!!errors.currency}
                />
              </FormField>
            </div>

            {formData.amount && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Payment Amount:</strong> {formatCurrency(formData.amount, formData.currency)}
                </p>
              </div>
            )}

            <FormField
              label="Recipient Account Number"
              error={errors.recipient_account}
              required
              tooltip="The recipient's bank account number"
              success={formData.recipient_account.length > 0 && !errors.recipient_account}
            >
              <Input
                type="text"
                value={formData.recipient_account}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("recipient_account", e.target.value)}
                placeholder="Enter recipient account number"
                error={!!errors.recipient_account}
              />
            </FormField>

            <FormField
              label="SWIFT Code"
              error={errors.swift_code}
              required
              tooltip="8 or 11 character SWIFT/BIC code (e.g., ABCDEF12 or ABCDEF12XYZ)"
              success={formData.swift_code.length >= 8 && !errors.swift_code}
            >
              <Input
                type="text"
                value={formData.swift_code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("swift_code", e.target.value.toUpperCase())}
                placeholder="ABCDEF12"
                maxLength={11}
                error={!!errors.swift_code}
                style={{ textTransform: 'uppercase' }}
              />
            </FormField>

            <FormField
              label="Reference (Optional)"
              tooltip="A reference note for this payment"
            >
              <Input
                type="text"
                value={formData.reference}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("reference", e.target.value)}
                placeholder="Payment reference or note"
                maxLength={100}
              />
            </FormField>

            <div className="flex space-x-4 pt-6">
              <Link
                to="/dashboard"
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Review Payment"}
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            🔒 All transactions are encrypted and processed through secure banking channels
          </p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmPayment}
        title="Confirm Payment"
        message={`Are you sure you want to send ${formatCurrency(formData.amount, formData.currency)} to account ${formData.recipient_account}?`}
        confirmText="Send Payment"
        confirmVariant="primary"
      />

      {/* Success Dialog */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Payment Submitted"
        showCloseButton={false}
      >
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <p className="text-slate-600">
            Your payment has been submitted successfully and is now being processed.
          </p>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">
              <strong>Transaction ID:</strong>
            </p>
            <p className="font-mono text-sm text-slate-900 mt-1">
              {transactionId}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Please save this transaction ID for your records.
          </p>
          <button
            onClick={() => {
              setShowSuccessDialog(false);
              navigate("/dashboard");
            }}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </Dialog>
    </Layout>
  );
}
