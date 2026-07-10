import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app-page">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-md bg-gradient-to-r from-[#00D6A3] to-[#0084FF] flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-[#00D6A3]/20">
            Q
          </div>
          <span className="font-extrabold text-text-primary tracking-tight text-xl">QuickSend</span>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-2">Privacy Policy</h1>
        <p className="text-text-secondary text-sm mb-8">Last updated: July 10, 2026</p>

        <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">1. Introduction</h2>
            <p>
              QuickSend ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">2. Information We Collect</h2>
            <p className="mb-2">We may collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, government-issued identification, and residential address required for KYC/AML compliance.</li>
              <li><strong>Financial Information:</strong> Bank account details, wallet addresses, transaction history, and payment method information.</li>
              <li><strong>Usage Data:</strong> IP address, browser type, device information, pages visited, and timestamps of interactions with our platform.</li>
              <li><strong>Communication Data:</strong> Records of correspondence with our support team, including emails and chat messages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">3. How We Use Your Information</h2>
            <p className="mb-2">We use collected information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide, maintain, and improve our services</li>
              <li>To process transactions and send transaction notifications</li>
              <li>To verify your identity and comply with KYC/AML regulations</li>
              <li>To detect and prevent fraud, abuse, and security incidents</li>
              <li>To communicate with you about your account and our services</li>
              <li>To comply with legal obligations and regulatory requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">4. Data Sharing and Disclosure</h2>
            <p className="mb-2">We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Service Providers:</strong> Third-party vendors who assist with identity verification, payment processing, compliance screening, and customer support.</li>
              <li><strong>Regulatory Authorities:</strong> When required by applicable law, regulation, or legal process.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of all or a portion of our assets.</li>
            </ul>
            <p className="mt-2">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">5. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption at rest and in transit, access controls, and regular security audits to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations (including AML record-keeping requirements), resolve disputes, and enforce our agreements. Retention periods vary by jurisdiction and regulatory requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">7. Your Rights</h2>
            <p className="mb-2">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Rectify inaccurate or incomplete information</li>
              <li>Delete your personal information (subject to legal obligations)</li>
              <li>Restrict or object to certain processing activities</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time where processing is based on consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">8. Cookies and Tracking</h2>
            <p>
              We use essential cookies to maintain session state and security. We may also use analytics cookies to understand how our platform is used. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">9. International Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place through standard contractual clauses or other recognized transfer mechanisms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes through the platform or via email. Your continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at <span className="text-primary">support@quicksend.com.mx</span>.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-text-subtle text-xs">
          &copy; {new Date().getFullYear()} QuickSend. All rights reserved.
        </div>
      </div>
    </div>
  );
}
