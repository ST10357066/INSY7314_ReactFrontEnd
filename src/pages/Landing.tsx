import { Link } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Lock, Globe, CreditCard, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";

export default function Landing() {
  const { user } = useAuth();

  const features = [
    {
      icon: Lock,
      title: "Bank-Grade Security",
      description: "End-to-end encryption and multi-factor authentication protect your transactions"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Send payments to over 200 countries with competitive exchange rates"
    },
    {
      icon: CreditCard,
      title: "Instant Processing",
      description: "Real-time transaction processing with immediate confirmation"
    }
  ];

  const securityFeatures = [
    "SSL/TLS encryption for all data transmission",
    "Multi-factor authentication",
    "Real-time fraud detection",
    "Compliance with international banking standards"
  ];

  return (
    <Layout>
      <div className="py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Secure International
              <span className="text-blue-600 block">Payments Made Simple</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Send money globally with confidence. Our secure platform ensures your international 
              payments are processed safely and efficiently.
            </p>
            
            <div className="flex justify-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
              Your Security is Our Priority
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Sending Money Securely?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who trust SecurePay for their international payments.
            </p>
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg"
            >
              Create Your Account
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
