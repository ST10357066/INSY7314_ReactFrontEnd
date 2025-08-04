import { Link } from "react-router";
import { ArrowLeft, FileText } from "lucide-react";
import Layout from "@/components/Layout";

export default function Terms() {
  return (
    <Layout>
      <div className="py-12 max-w-4xl mx-auto">
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
          <div className="flex justify-center mb-4">
            <FileText className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-slate-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Acceptance of Terms</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                By accessing and using SecurePay ("the Service"), you accept and agree to be bound by 
                the terms and provision of this agreement. These Terms of Service govern your use of 
                our international payment services.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Service Description</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                SecurePay provides secure international payment services, allowing users to send money 
                globally through our platform. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>International wire transfers and payments</li>
                <li>Multi-currency transaction processing</li>
                <li>Real-time transaction tracking and notifications</li>
                <li>Secure account management and banking integration</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">User Responsibilities</h2>
            <div className="text-slate-700 space-y-4">
              <p>By using our service, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information when creating your account</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the service only for lawful purposes</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not engage in fraudulent or suspicious activities</li>
                <li>Report any unauthorized use of your account immediately</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Transaction Limits and Fees</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                Transaction limits and fees may apply based on your account type, destination country, 
                and payment method. Current limits and fees are:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <p><strong>Daily Limit:</strong> $50,000 USD equivalent</p>
                <p><strong>Monthly Limit:</strong> $500,000 USD equivalent</p>
                <p><strong>Transfer Fee:</strong> 0.5% - 2.0% depending on destination</p>
                <p><strong>Currency Conversion:</strong> Market rate + 0.5% margin</p>
              </div>
              <p>
                We reserve the right to modify limits and fees with reasonable notice to users.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Account Verification</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                To ensure security and comply with regulatory requirements, we require account verification:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Government-issued photo identification</li>
                <li>Proof of address (utility bill or bank statement)</li>
                <li>Bank account verification</li>
                <li>Additional documentation may be required for large transactions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Privacy and Data Protection</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                Your privacy is important to us. We collect, use, and protect your personal information 
                in accordance with our Privacy Policy. By using our service, you consent to the 
                collection and use of information as described in our Privacy Policy.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Limitation of Liability</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                SecurePay shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Loss of profits or business opportunities</li>
                <li>Delays in transaction processing due to technical issues</li>
                <li>Currency fluctuation losses</li>
                <li>Third-party service interruptions</li>
              </ul>
              <p>
                Our total liability shall not exceed the amount of fees paid by you in the 12 months 
                preceding the claim.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Termination</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                We may terminate or suspend your account at any time for violation of these terms, 
                suspicious activity, or as required by law. You may also terminate your account at 
                any time by contacting our support team.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Information</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p><strong>Email:</strong> legal@securepay.com</p>
                <p><strong>Address:</strong> 123 Financial District, Cape Town, South Africa</p>
                <p><strong>Phone:</strong> +27 (0)21 123-4567</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to Terms</h2>
            <div className="text-slate-700">
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any 
                material changes via email or through our platform. Continued use of the service after 
                changes constitutes acceptance of the new terms.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
