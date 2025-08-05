import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  User,
  MapPin,
  FileText,
  Bell,
  Globe,
  Eye,
  Shield,
  Trash2,
  Camera,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Clock,
  X,
  Upload,
} from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FormField, Input, Select } from "@/components/FormField";
import Dialog, { ConfirmDialog } from "@/components/Dialog";
import {
  UserProfile,
  UserProfileSchema,
  LANGUAGES,
  CURRENCIES,
  THEMES,
  KYC_DOCUMENT_TYPES,
  type KYCDocument
} from "@/shared/types";
import { z } from "zod";

export default function Profile() {
  const { user, isPending } = useAuth();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    full_name: "",
    id_number: "",
    account_number: "",
    username: "",
    phone_number: "",
    phone_verified: false,
    date_of_birth: "",
    gender: "",
    profile_picture: "",
    address: {
      street_address: "",
      city: "",
      state_province: "",
      postal_code: "",
      country: "",
    },
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
      profile_visibility: "private" as const,
      show_online_status: false,
      allow_data_sharing: false,
      allow_analytics: true,
      allow_cookies: true,
    },
    user_preferences: {
      language: "en" as const,
      currency: "USD" as const,
      timezone: "UTC",
      date_format: "MM/DD/YYYY" as const,
      theme: "light" as const,
      email_frequency: "immediate" as const,
    },
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Remove: const { t } = useTranslation();

  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/profile");
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || "",
          id_number: profileData.id_number || "",
          account_number: profileData.account_number || "",
          username: profileData.username || "",
          phone_number: profileData.phone_number || "",
          phone_verified: profileData.phone_verified || false,
          date_of_birth: profileData.date_of_birth || "",
          gender: profileData.gender || "",
          profile_picture: profileData.profile_picture || "",
          address: profileData.address || {
            street_address: "",
            city: "",
            state_province: "",
            postal_code: "",
            country: "",
          },
          notification_settings: profileData.notification_settings || {
            email_notifications: true,
            sms_notifications: false,
            push_notifications: true,
            transaction_alerts: true,
            security_alerts: true,
            marketing_emails: false,
            weekly_reports: false,
          },
          privacy_settings: profileData.privacy_settings || {
            profile_visibility: "private" as const,
            show_online_status: false,
            allow_data_sharing: false,
            allow_analytics: true,
            allow_cookies: true,
          },
          user_preferences: profileData.user_preferences || {
            language: "en" as const,
            currency: "USD" as const,
            timezone: "UTC",
            date_format: "MM/DD/YYYY" as const,
            theme: "light" as const,
            email_frequency: "immediate" as const,
          },
        });
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, isPending, navigate, fetchProfile]);

  // Cleanup file URLs on unmount
  useEffect(() => {
    return () => {
      fileUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [fileUrls]);

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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_settings: { ...prev.notification_settings, [field]: value }
    }));
  };

  const handlePrivacyChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      privacy_settings: { ...prev.privacy_settings, [field]: value }
    }));
  };

  const handlePreferencesChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      user_preferences: { ...prev.user_preferences, [field]: value }
    }));
    
    // Sync theme changes with global context
    if (field === 'theme') {
      setTheme(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);
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
        await fetchProfile();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      setError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file");
      return;
    }

    setUploadingFile(true);
    setError(null);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock file URL
      const fileUrl = URL.createObjectURL(file);
      setFileUrls(prev => [...prev, fileUrl]);
      handleInputChange("profile_picture", fileUrl);
    } catch (error) {
      console.error("File upload failed:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePhoneVerification = async () => {
    if (!formData.phone_number) {
      setError("Please enter a phone number first");
      return;
    }

    try {
      setError(null);
      // Simulate phone verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleInputChange("phone_verified", true);
    } catch (error) {
      console.error("Phone verification failed:", error);
      setError("Failed to verify phone number. Please try again.");
    }
  };

  const handleKYCDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a PDF or image file (JPEG, PNG)");
      return;
    }

    setUploadingFile(true);
    setError(null);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileUrl = URL.createObjectURL(file);
      setFileUrls(prev => [...prev, fileUrl]);
      
      const newDocument: KYCDocument = {
        type: type as any,
        file_name: file.name,
        file_url: fileUrl,
        uploaded_at: new Date().toISOString(),
        verified: false,
      };

      const updatedDocuments = [...(profile?.kyc_documents || []), newDocument];
      setProfile(prev => prev ? { ...prev, kyc_documents: updatedDocuments } : null);
    } catch (error) {
      console.error("KYC document upload failed:", error);
      setError("Failed to upload document. Please try again.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      setError(null);
      const response = await fetch("/api/profile/delete", {
        method: "POST",
      });

      if (response.ok) {
        // Redirect to logout
        navigate("/logout");
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      console.error("Account deletion failed:", error);
      setError("Failed to delete account. Please try again.");
    }
  };

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
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

  if (error && !isLoading) {
    return (
      <Layout showSidebar>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Profile</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={fetchProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "address", label: "Address", icon: MapPin },
    { id: "kyc", label: "KYC Documents", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <Layout showSidebar>
              <div className="p-6 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Profile Settings</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your account information, preferences, and security settings.
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Profile Information</h2>
                  
                  {/* Profile Picture */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-slate-700 mb-4">Profile Picture</label>
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                          {formData.profile_picture ? (
                            <img 
                              src={formData.profile_picture} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-12 h-12 text-slate-400" />
                          )}
                        </div>
                        {uploadingFile && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <LoadingSpinner size="sm" />
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                          id="profile-picture"
                        />
                        <label
                          htmlFor="profile-picture"
                          className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {formData.profile_picture ? "Change Photo" : "Upload Photo"}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Full Name"
                      error={errors.full_name}
                      required
                      success={formData.full_name.length > 0 && !errors.full_name}
                    >
                      <Input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        placeholder="Enter your full name"
                        error={!!errors.full_name}
                      />
                    </FormField>

                    <FormField
                      label="Username"
                      error={errors.username}
                      required
                      success={formData.username.length >= 3 && !errors.username}
                    >
                      <Input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        placeholder="johndoe"
                        maxLength={20}
                        error={!!errors.username}
                      />
                    </FormField>

                    <FormField
                      label="Phone Number"
                      error={errors.phone_number}
                      tooltip="International format (e.g., +1234567890)"
                    >
                      <div className="flex space-x-2">
                        <Input
                          type="tel"
                          value={formData.phone_number}
                          onChange={(e) => handleInputChange("phone_number", e.target.value)}
                          placeholder="+1234567890"
                          error={!!errors.phone_number}
                        />
                        {formData.phone_number && !formData.phone_verified && (
                          <button
                            type="button"
                            onClick={handlePhoneVerification}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Verify
                          </button>
                        )}
                        {formData.phone_verified && (
                          <div className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Verified</span>
                          </div>
                        )}
                      </div>
                    </FormField>

                    <FormField
                      label="Date of Birth"
                    >
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                      />
                    </FormField>

                    <FormField
                      label="Gender"
                    >
                      <Select
                        value={formData.gender}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        options={[
                          { value: "", label: "Select gender" },
                          { value: "male", label: "Male" },
                          { value: "female", label: "Female" },
                          { value: "other", label: "Other" },
                          { value: "prefer_not_to_say", label: "Prefer not to say" },
                        ]}
                      />
                    </FormField>

                    <FormField
                      label="ID Number"
                      error={errors.id_number}
                      required
                      tooltip="13-digit South African ID number"
                    >
                      <Input
                        type="text"
                        value={formData.id_number}
                        onChange={(e) => handleInputChange("id_number", e.target.value)}
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
                    >
                      <Input
                        type="text"
                        value={formData.account_number}
                        onChange={(e) => handleInputChange("account_number", e.target.value)}
                        placeholder="12345678"
                        maxLength={12}
                        error={!!errors.account_number}
                      />
                    </FormField>
                  </div>

                  {/* Account Verification Status */}
                  {profile && (
                    <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getVerificationStatusIcon(profile.account_verification_status)}
                          <div>
                            <h3 className="font-medium text-slate-900">Account Verification</h3>
                            <p className="text-sm text-slate-600">
                              Status: {profile.account_verification_status}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(profile.account_verification_status)}`}>
                          {profile.account_verification_status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

                             {/* Address Tab */}
               {activeTab === "address" && (
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                   <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Address Information</h2>
                  
                  <div className="space-y-6">
                                         <FormField
                       label="Street Address"
                       error={errors["address.street_address"]}
                       required
                     >
                       <Input
                         type="text"
                         value={formData.address.street_address}
                         onChange={(e) => handleAddressChange("street_address", e.target.value)}
                         placeholder="123 Main Street"
                         error={!!errors["address.street_address"]}
                       />
                     </FormField>

                     <div className="grid md:grid-cols-2 gap-6">
                       <FormField
                         label="City"
                         error={errors["address.city"]}
                         required
                       >
                         <Input
                           type="text"
                           value={formData.address.city}
                           onChange={(e) => handleAddressChange("city", e.target.value)}
                           placeholder="Cape Town"
                           error={!!errors["address.city"]}
                         />
                       </FormField>

                       <FormField
                         label="State/Province"
                         error={errors["address.state_province"]}
                         required
                       >
                         <Input
                           type="text"
                           value={formData.address.state_province}
                           onChange={(e) => handleAddressChange("state_province", e.target.value)}
                           placeholder="Western Cape"
                           error={!!errors["address.state_province"]}
                         />
                       </FormField>

                       <FormField
                         label="Postal Code"
                         error={errors["address.postal_code"]}
                         required
                       >
                         <Input
                           type="text"
                           value={formData.address.postal_code}
                           onChange={(e) => handleAddressChange("postal_code", e.target.value)}
                           placeholder="8001"
                           error={!!errors["address.postal_code"]}
                         />
                       </FormField>

                       <FormField
                         label="Country"
                         error={errors["address.country"]}
                         required
                       >
                         <Input
                           type="text"
                           value={formData.address.country}
                           onChange={(e) => handleAddressChange("country", e.target.value)}
                           placeholder="South Africa"
                           error={!!errors["address.country"]}
                         />
                       </FormField>
                     </div>
                  </div>
                </div>
              )}

                             {/* KYC Documents Tab */}
               {activeTab === "kyc" && (
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                   <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">KYC Documents</h2>
                  
                  <div className="space-y-6">
                    {KYC_DOCUMENT_TYPES.map((docType) => {
                      const existingDoc = profile?.kyc_documents?.find(doc => doc.type === docType.value);
                      
                      return (
                        <div key={docType.value} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium text-slate-900">{docType.label}</h3>
                              <p className="text-sm text-slate-600">
                                {existingDoc ? "Document uploaded" : "Document required for verification"}
                              </p>
                            </div>
                            {existingDoc && (
                              <div className="flex items-center space-x-2">
                                {existingDoc.verified ? (
                                  <div className="flex items-center text-green-600">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    <span className="text-sm">Verified</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-yellow-600">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span className="text-sm">Pending</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {existingDoc ? (
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <p className="text-sm text-slate-600">{existingDoc.file_name}</p>
                                <p className="text-xs text-slate-500">
                                  Uploaded: {new Date(existingDoc.uploaded_at).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleKYCDocumentUpload(e, docType.value)}
                                className="hidden"
                                id={`kyc-${docType.value}`}
                              />
                              <label
                                htmlFor={`kyc-${docType.value}`}
                                className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload {docType.label}
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

                             {/* Notifications Tab */}
               {activeTab === "notifications" && (
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                   <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Notification Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium text-slate-900">Email Notifications</h3>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.notification_settings.email_notifications}
                              onChange={(e) => handleNotificationChange("email_notifications", e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700">Email notifications</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.notification_settings.transaction_alerts}
                              onChange={(e) => handleNotificationChange("transaction_alerts", e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700">Transaction alerts</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.notification_settings.security_alerts}
                              onChange={(e) => handleNotificationChange("security_alerts", e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700">Security alerts</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.notification_settings.marketing_emails}
                              onChange={(e) => handleNotificationChange("marketing_emails", e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700">Marketing emails</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium text-slate-900">Other Notifications</h3>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.notification_settings.sms_notifications}
                              onChange={(e) => handleNotificationChange("sms_notifications", e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700">SMS notifications</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.notification_settings.push_notifications}
                              onChange={(e) => handleNotificationChange("push_notifications", e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700">Push notifications</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.notification_settings.weekly_reports}
                              onChange={(e) => handleNotificationChange("weekly_reports", e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700">Weekly reports</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                             {/* Preferences Tab */}
               {activeTab === "preferences" && (
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                   <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">User Preferences</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Language"
                    >
                      <Select
                        value={formData.user_preferences.language}
                        onChange={(e) => handlePreferencesChange("language", e.target.value)}
                        options={LANGUAGES.map(lang => ({ value: lang.value, label: lang.label }))}
                      />
                    </FormField>

                    <FormField
                      label="Currency"
                    >
                      <Select
                        value={formData.user_preferences.currency}
                        onChange={(e) => handlePreferencesChange("currency", e.target.value)}
                        options={CURRENCIES.map(currency => ({ value: currency.value, label: currency.label }))}
                      />
                    </FormField>

                    <FormField
                      label="Theme"
                    >
                      <Select
                        value={formData.user_preferences.theme}
                        onChange={(e) => handlePreferencesChange("theme", e.target.value)}
                        options={THEMES.map(theme => ({ value: theme.value, label: theme.label }))}
                      />
                    </FormField>

                    <FormField
                      label="Date Format"
                    >
                      <Select
                        value={formData.user_preferences.date_format}
                        onChange={(e) => handlePreferencesChange("date_format", e.target.value)}
                        options={[
                          { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                          { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                          { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                        ]}
                      />
                    </FormField>

                    <FormField
                      label="Timezone"
                    >
                      <Input
                        type="text"
                        value={formData.user_preferences.timezone}
                        onChange={(e) => handlePreferencesChange("timezone", e.target.value)}
                        placeholder="UTC"
                      />
                    </FormField>

                    <FormField
                      label="Email Frequency"
                    >
                      <Select
                        value={formData.user_preferences.email_frequency}
                        onChange={(e) => handlePreferencesChange("email_frequency", e.target.value)}
                        options={[
                          { value: "immediate", label: "Immediate" },
                          { value: "daily", label: "Daily Digest" },
                          { value: "weekly", label: "Weekly Digest" },
                        ]}
                      />
                    </FormField>
                  </div>
                </div>
              )}

                             {/* Privacy Tab */}
               {activeTab === "privacy" && (
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                   <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-900">Profile Visibility</h3>
                      <FormField
                        label="Profile Visibility"
                      >
                        <Select
                          value={formData.privacy_settings.profile_visibility}
                          onChange={(e) => handlePrivacyChange("profile_visibility", e.target.value)}
                          options={[
                            { value: "public", label: "Public" },
                            { value: "private", label: "Private" },
                            { value: "friends_only", label: "Friends Only" },
                          ]}
                        />
                      </FormField>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-900">Privacy Controls</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.privacy_settings.show_online_status}
                            onChange={(e) => handlePrivacyChange("show_online_status", e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-700">Show online status</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.privacy_settings.allow_data_sharing}
                            onChange={(e) => handlePrivacyChange("allow_data_sharing", e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-700">Allow data sharing with partners</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.privacy_settings.allow_analytics}
                            onChange={(e) => handlePrivacyChange("allow_analytics", e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-700">Allow analytics and tracking</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.privacy_settings.allow_cookies}
                            onChange={(e) => handlePrivacyChange("allow_cookies", e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-700">Allow cookies</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-red-900">Danger Zone</h3>
                          <p className="text-sm text-red-700 mt-1">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowDeleteDialog(true)}
                            className="mt-3 inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {activeTab !== "security" && (
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <LoadingSpinner size="sm" /> : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
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

      {/* Delete Account Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleAccountDeletion}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        confirmText="Delete Account"
        confirmVariant="danger"
        cancelText="Cancel"
      />
    </Layout>
  );
}
