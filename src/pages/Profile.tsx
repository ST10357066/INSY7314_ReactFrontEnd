import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, User, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FormField, Input } from "@/components/FormField";
import Dialog from "@/components/Dialog";
import { UserProfile, UserProfileSchema } from "@/shared/types";
import { z } from "zod";

export default function Profile() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    id_number: "",
    account_number: "",
    username: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, isPending, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || "",
          id_number: profileData.id_number || "",
          account_number: profileData.account_number || "",
          username: profileData.username || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
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

    setIsSaving(true);
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
        // Refresh profile data
        await fetchProfile();
      } else {
        const errorData = await response.json();
        console.error("Profile update failed:", errorData);
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return `****${accountNumber.slice(-4)}`;
  };

  if (isPending || isLoading) {
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
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile</h1>
          <p className="text-slate-600">
            Manage your account information and banking details.
          </p>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">Account Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium text-slate-500">Email</label>
              <p className="text-slate-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Account Created</label>
              <p className="text-slate-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {profile && (
            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div>
                <label className="text-sm font-medium text-slate-500">Full Name</label>
                <p className="text-slate-900">{profile.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Username</label>
                <p className="text-slate-900">{profile.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">ID Number</label>
                <p className="text-slate-900">{profile.id_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Account Number</label>
                <p className="text-slate-900">{maskAccountNumber(profile.account_number)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Update Profile Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Update Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex space-x-4 pt-6">
              <Link
                to="/dashboard"
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <LoadingSpinner size="sm" /> : "Update Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            🔒 Your personal information is encrypted and stored securely
          </p>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Profile Updated"
        showCloseButton={false}
      >
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <p className="text-slate-600">
            Your profile has been updated successfully.
          </p>
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
