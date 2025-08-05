import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FormField, Input, Select } from "@/components/FormField";
import Dialog, { ConfirmDialog } from "@/components/Dialog";

export default function PaymentForm() {
  const { user, isPending } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  
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

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = "Amount must be a positive number";
      }
    }
    
    if (!formData.recipient_account.trim()) {
      newErrors.recipient_account = "Recipient account is required";
    }
    
    if (!formData.swift_code.trim()) {
      newErrors.swift_code = "SWIFT code is required";
    } else if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(formData.swift_code)) {
      newErrors.swift_code = "Invalid SWIFT code format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    // Clear general error when user makes changes
    if (error) {
      setError(null);
    }
  }, [errors, error]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmDialog(true);
  }, [validateForm]);

  const handleConfirmPayment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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
        setErrors({});
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment failed");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setError(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const formatCurrency = useCallback((amount: string, currency: string) => {
    if (!amount) return "";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return "";
    
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
    }).format(numAmount);
  }, [i18n.language]);

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
      <div className="p-6 max-w-4xl mx-auto">
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
            Send money internationally with secure, fast transfers.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

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
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="0.00"
                  error={!!errors.amount}
                />
              </FormField>

              <FormField
                label="Currency"
                required
              >
                <Select
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  options={[
                    { value: "USD", label: "USD - US Dollar" },
                    { value: "EUR", label: "EUR - Euro" },
                    { value: "ZAR", label: "ZAR - South African Rand" },
                    { value: "GBP", label: "GBP - British Pound" },
                    { value: "JPY", label: "JPY - Japanese Yen" },
                  ]}
                />
              </FormField>
            </div>

            <FormField
              label="Recipient Account Number"
              error={errors.recipient_account}
              required
              tooltip="Enter the recipient's bank account number"
            >
              <Input
                type="text"
                value={formData.recipient_account}
                onChange={(e) => handleInputChange("recipient_account", e.target.value)}
                placeholder="1234567890"
                error={!!errors.recipient_account}
              />
            </FormField>

            <FormField
              label="SWIFT Code"
              error={errors.swift_code}
              required
              tooltip="Bank's SWIFT/BIC code (e.g., ABCDUS33)"
            >
              <Input
                type="text"
                value={formData.swift_code}
                onChange={(e) => handleInputChange("swift_code", e.target.value.toUpperCase())}
                placeholder="ABCDUS33"
                maxLength={11}
                error={!!errors.swift_code}
              />
            </FormField>

            <FormField
              label="Reference (Optional)"
              tooltip="Add a reference for this payment"
            >
              <Input
                type="text"
                value={formData.reference}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                placeholder="Payment for services"
              />
            </FormField>

            {/* Payment Summary */}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Payment Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">{formatCurrency(formData.amount, formData.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer Fee:</span>
                    <span className="font-semibold">{formatCurrency((parseFloat(formData.amount) * 0.02).toString(), formData.currency)}</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency((parseFloat(formData.amount) * 1.02).toString(), formData.currency)}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !formData.amount || parseFloat(formData.amount) <= 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Continue to Payment"}
            </button>
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
        message={`Are you sure you want to send ${formatCurrency(formData.amount, formData.currency)} to ${formData.recipient_account}?`}
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
