import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FormField, Input } from "@/components/FormField";
import Dialog from "@/components/Dialog";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      ForgotPasswordSchema.parse(formData);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccessDialog(true);
      setFormData({ email: "" });
    } catch (error) {
      console.error("Password reset failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="max-w-md w-full">
          {/* Back Link */}
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>

          {/* Reset Password Card */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Mail className="w-12 h-12 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Reset Your Password
              </h1>
              <p className="text-slate-600">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                label="Email Address"
                error={errors.email}
                required
                success={formData.email.includes("@") && !errors.email}
              >
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your registered email address"
                  error={!!errors.email}
                />
              </FormField>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  "Send Reset Instructions"
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <Mail className="w-4 h-4 inline mr-1" />
              Password reset links are valid for 24 hours and can only be used once
            </p>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Need Additional Help?</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>• Check your spam or junk folder if you don't receive the email within 5 minutes</p>
              <p>• Reset links expire after 24 hours for security reasons</p>
              <p>• If you're still having trouble, <Link to="/contact" className="text-blue-600 hover:text-blue-500">contact our support team</Link></p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Reset Link Sent"
        showCloseButton={false}
      >
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <p className="text-slate-600">
            We've sent password reset instructions to your email address. 
            Please check your inbox and follow the link to reset your password.
          </p>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The reset link will expire in 24 hours for security reasons.
            </p>
          </div>
          <button
            onClick={() => setShowSuccessDialog(false)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </Dialog>
    </Layout>
  );
}
