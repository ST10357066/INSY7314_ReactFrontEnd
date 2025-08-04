import { Link } from "react-router";
import { ArrowLeft, Shield } from "lucide-react";
import Layout from "@/components/Layout";

export default function Privacy() {
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
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-slate-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information We Collect</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                make a payment, or contact us for support. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Personal identification information (name, email address, ID number)</li>
                <li>Banking information (account numbers, SWIFT codes)</li>
                <li>Transaction data and payment history</li>
                <li>Communication records when you contact us</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">How We Use Your Information</h2>
            <div className="text-slate-700 space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process and facilitate your international payments</li>
                <li>Verify your identity and prevent fraud</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Improve our services and user experience</li>
                <li>Communicate with you about your account and transactions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Security</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                We implement industry-standard security measures to protect your personal and financial information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>End-to-end encryption for all data transmission</li>
                <li>Secure storage with bank-grade encryption</li>
                <li>Multi-factor authentication and access controls</li>
                <li>Regular security audits and compliance checks</li>
                <li>PCI DSS compliance for payment processing</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information Sharing</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties, 
                except in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or court orders</li>
                <li>To prevent fraud or protect our legal rights</li>
                <li>With trusted service providers who assist in our operations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Rights</h2>
            <div className="text-slate-700 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt out of marketing communications</li>
                <li>Receive a copy of your data in a portable format</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
            <div className="text-slate-700 space-y-4">
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p><strong>Email:</strong> privacy@securepay.com</p>
                <p><strong>Address:</strong> 123 Financial District, Cape Town, South Africa</p>
                <p><strong>Phone:</strong> +27 (0)21 123-4567</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to This Policy</h2>
            <div className="text-slate-700">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new policy on this page and updating the "last updated" date above. 
                Your continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
