 
import React from "react";
import { useNavigate } from "react-router-dom";

const UPDATED_ON = "September 5, 2025";

const TermsAndConditionsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-light text-white">
            Terms &amp; Conditions — kai
            <span className="text-amber-400">°</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Last updated: {UPDATED_ON}
          </p>
        </header>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl text-white mb-2">1. Introduction</h2>
            <p>
              Welcome to kai° (“we”, “us”, “our”). These Terms &amp; Conditions
              (“Terms”) govern your access to and use of the kai° concierge
              application and related services (“Services”). By creating an
              account or using the Services, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">2. Our Services</h2>
            <p>
              kai° provides AI-assisted concierge features—such as task
              management, recommendations, travel planning, and messaging—to
              help streamline your personal and professional life. Some features
              may be experimental and may change or be discontinued at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">
              3. Your Responsibilities
            </h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Provide accurate account information and keep your credentials
                secure.
              </li>
              <li>
                Use the Services lawfully and for permitted purposes only.
              </li>
              <li>
                Do not upload content that infringes others’ rights or violates
                applicable law.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">4. Privacy &amp; Data</h2>
            <p>
              We process personal data in accordance with our Privacy Policy. By
              using the Services, you consent to such processing. Where
              required, we will seek additional consent for specific features
              (e.g., voice notes).
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">
              5. AI Limitations &amp; No Advice
            </h2>
            <p>
              Outputs may be inaccurate, incomplete, or outdated. The Services
              do not provide legal, medical, financial, or other professional
              advice. You are responsible for verifying critical information
              before relying on it.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">6. Fees</h2>
            <p>
              Some features may require payment or a subscription. If
              applicable, you agree to pay all charges and taxes associated with
              your plan. Prices and features are subject to change with notice
              as required by law or contract.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">7. Acceptable Use</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                No attempts to breach or probe our systems or other users’
                accounts.
              </li>
              <li>
                No spam, malware, or attempts to manipulate model outputs.
              </li>
              <li>
                No unlawful, harmful, harassing, or discriminatory content.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">
              8. Intellectual Property
            </h2>
            <p>
              We retain all rights in our Services and content. You retain
              rights in your own content. You grant us a limited license to
              host, process, and display your content solely to provide the
              Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">9. Third-Party Services</h2>
            <p>
              The Services may link to or integrate third-party sites or APIs.
              We are not responsible for third-party content, policies, or
              availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">10. Warranty Disclaimer</h2>
            <p>
              The Services are provided “as is” without warranties of any kind,
              express or implied, including merchantability, fitness for a
              particular purpose, and non-infringement. Use is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">
              11. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, we are not liable for
              indirect, incidental, special, consequential, or punitive damages,
              or any loss of profits, data, or goodwill arising from your use of
              the Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">12. Termination</h2>
            <p>
              We may suspend or terminate your access if you breach these Terms
              or create risk for us or others. You may stop using the Services
              at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">
              13. Changes to these Terms
            </h2>
            <p>
              We may update these Terms. Material changes will be notified as
              required by law. Continued use after updates constitutes
              acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">14. Governing Law</h2>
            <p>
              These Terms will be governed by the laws applicable in your
              primary country of residence unless otherwise required by
              mandatory consumer laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-2">15. Contact</h2>
            <p>
              Questions? Contact support at{" "}
              <span className="text-amber-400">support@kai.app</span>.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white hover:bg-slate-700"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
