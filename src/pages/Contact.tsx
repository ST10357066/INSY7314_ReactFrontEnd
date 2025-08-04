import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail, Phone, MapPin, Clock, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FormField, Input } from "@/components/FormField";
import Dialog from "@/components/Dialog";

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setShowSuccessDialog(true);
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setIsLoading(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      details: "support@securepay.com",
      description: "Get help with your account or transactions"
    },
    {
      icon: Phone,
      title: "Phone Support",
      details: "+27 (0)21 123-4567",
      description: "Monday - Friday, 8:00 AM - 6:00 PM SAST"
    },
    {
      icon: MapPin,
      title: "Office Address",
      details: "123 Financial District, Cape Town, South Africa",
      description: "Our headquarters and main office"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Monday - Friday: 8:00 AM - 6:00 PM SAST",
      description: "Weekend support available for urgent matters"
    }
  ];

  return (
    <Layout>
      <div className="py-12 max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Need help with your account or have questions about our services? 
            We're here to assist you with all your international payment needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  label="Full Name"
                  error={errors.name}
                  required
                  success={formData.name.length > 0 && !errors.name}
                >
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    error={!!errors.name}
                  />
                </FormField>

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
                    placeholder="Enter your email"
                    error={!!errors.email}
                  />
                </FormField>
              </div>

              <FormField
                label="Subject"
                error={errors.subject}
                required
                success={formData.subject.length > 0 && !errors.subject}
              >
                <Input
                  type="text"
                  value={formData.subject}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("subject", e.target.value)}
                  placeholder="What is this regarding?"
                  error={!!errors.subject}
                />
              </FormField>

              <FormField
                label="Message"
                error={errors.message}
                required
                success={formData.message.length >= 10 && !errors.message}
              >
                <textarea
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors ${
                    errors.message 
                      ? "border-red-300 text-red-900 placeholder-red-300" 
                      : "border-slate-300 text-slate-900"
                  }`}
                  rows={5}
                  value={formData.message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("message", e.target.value)}
                  placeholder="Please describe your inquiry in detail..."
                />
              </FormField>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Send Message"}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {info.title}
                        </h3>
                        <p className="text-blue-600 font-medium mb-1">
                          {info.details}
                        </p>
                        <p className="text-sm text-slate-600">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Common Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">How long do international transfers take?</h3>
                  <p className="text-sm text-slate-600">Most transfers complete within 1-3 business days, depending on the destination country and banking hours.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">What are your transfer limits?</h3>
                  <p className="text-sm text-slate-600">Daily limits are $50,000 USD equivalent, with monthly limits up to $500,000 USD equivalent.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">How do I track my payment?</h3>
                  <p className="text-sm text-slate-600">All transactions receive a unique ID that you can use to track status in your dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Message Sent Successfully"
        showCloseButton={false}
      >
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <p className="text-slate-600">
            Thank you for contacting us! We'll get back to you within 24 hours.
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
