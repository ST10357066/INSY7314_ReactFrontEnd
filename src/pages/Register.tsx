import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, ArrowLeft, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import Dialog from "@/components/Dialog";
import { FormField, Input } from "@/components/FormField";
import { UserProfileSchema } from "@/shared/types";
import { z } from "zod";

export default function Register() {
  const { user, redirectToLogin, isPending } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    id_number: "",
    account_number: "",
    username: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await redirectToLogin();
    } catch (error) {
      console.error("Sign up failed:", error);
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    try {
      UserProfileSchema.parse(formData);
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

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowSuccessDialog(true);
      } else {
        const errorData = await response.json();
        console.error("Profile creation failed:", errorData);
      }
    } catch (error) {
      console.error("Profile creation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Show profile form if user is logged in but hasn't completed profile
  if (user && !showSuccessDialog && !showProfileForm) {
    setShowProfileForm(true);
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="max-w-md w-full">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>

          {/* Registration Card */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Shield className="w-12 h-12 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {showProfileForm ? "Complete Your Profile" : "Create Account"}
              </h1>
              <p className="text-slate-600">
                {showProfileForm 
                  ? "Please provide your banking details to complete registration"
                  : "Join SecurePay to start sending international payments securely"
                }
              </p>
            </div>

            {showProfileForm ? (
              <form onSubmit={handleSubmitProfile} className="space-y-6">
                <FormField
                  label="Full Name"
                  error={errors.full_name}
                  required
                  success={formData.full_name.length > 0 && !errors.full_name}
                >
                  <Input
                    type="text"
                    value={formData.full_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("full_name", e.target.value)}
                    placeholder="Enter your full name"
                    error={!!errors.full_name}
                  />
                </FormField>

                <FormField
                  label="ID Number"
                  error={errors.id_number}
                  required
                  tooltip="13-digit South African ID number"
                  success={formData.id_number.length === 13 && !errors.id_number}
                >
                  <Input
                    type="text"
                    value={formData.id_number}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("id_number", e.target.value)}
                    placeholder="1234567890123"
                    maxLength={13}
                    error={!!errors.id_number}
                  />
                </FormField>

                <FormField
                  label="Account Number"
                  error={errors.account_number}
                  required
                  tooltip="Your bank account number (8-12 digits)"
                  success={formData.account_number.length >= 8 && !errors.account_number}
                >
                  <Input
                    type="text"
                    value={formData.account_number}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("account_number", e.target.value)}
                    placeholder="12345678"
                    maxLength={12}
                    error={!!errors.account_number}
                  />
                </FormField>

                <FormField
                  label="Username"
                  error={errors.username}
                  required
                  tooltip="3-20 characters, letters, numbers, dots, underscores, and hyphens only"
                  success={formData.username.length >= 3 && !errors.username}
                >
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("username", e.target.value)}
                    placeholder="johndoe"
                    maxLength={20}
                    error={!!errors.username}
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
                    "Complete Registration"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={handleGoogleSignUp}
                  disabled={isLoading || isPending}
                  className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading || isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign up with Google
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <Shield className="w-4 h-4 inline mr-1" />
              All data is encrypted and stored securely
            </p>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Registration Successful!"
        showCloseButton={false}
      >
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <p className="text-slate-600">
            Your account has been created successfully! You can now start making secure international payments.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </Dialog>
    </Layout>
  );
}
