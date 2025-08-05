import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import Layout from "@/components/Layout";

export default function AuthCallback() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleNavigation = useCallback(() => {
    if (!isPending) {
      if (user) {
        // User is authenticated, redirect to dashboard
        navigate("/dashboard");
      } else {
        // No user, redirect to login
        setError("Authentication failed. Please try again.");
        setTimeout(() => navigate("/login"), 3000);
      }
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    handleNavigation();
  }, [handleNavigation]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        {error ? (
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-2">
              {error}
            </div>
            <p className="text-slate-600">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Completing sign in...
            </h2>
            <p className="text-slate-600">
              Please wait while we set up your account.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
